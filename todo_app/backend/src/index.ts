import { Context, Hono, type Next } from 'hono'
import { serve } from '@hono/node-server'
import { HTTPException} from 'hono/http-exception'
import { sValidator } from '@hono/standard-validator'
import { logger } from 'hono/logger'
import { Pool } from 'pg'
//import { cors } from 'hono/cors'

import { todoSchema, type Todo }  from './model.js'

const PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 3001

const app = new Hono()

app.use(async (c, next) => {
  if(c.req.path === '/health' || c.req.path === '/ready') {
    // Skip logging
    return await next()
  }

  //logger() is a middleware factory function, the output gets called with (c, next)
  return logger()(c, next)
})

//This is not required if using the frontend as a proxy or routing through ingress
//app.use('/*', cors())

export const postLogger = async (c: Context, next: Next) => {
  try {
    // Clone because the stream gets consumed if read
    console.log(`Request body: ${ await c.req.raw.clone().text()}`)
  } catch (e){
    console.error(`Error reading request body: ${ e }`)
  }

  await next()
}

app.post(postLogger)

// Uses Postgres environment variables set for configuring the connection
const pool = new Pool()

pool.on('error', (err) => {
  console.error('Pg pool error!', err.message)
})

const getTodosFromDB = async () => {
  const q_res = await pool.query('SELECT id, title FROM todos')
  return q_res.rows
}

// Cluster service health check path
app.get('/health', (c) => {
  return c.text('Todo backend healthy.')
})

// Readiness check path
// It seems that the best way to check the postgres connection is to perform a cheap query.
// For example: https://github.com/brianc/node-postgres/issues/3208
app.get('/ready', async (c) => {
  try {
    // Will throw if not successful
    await pool.query('SELECT 1')
    return c.text('Todo backend ready.')
  } catch {
    return c.text('Database connection not ready.', 503)
  }
})

app.get('/todos', async (c) => {
  return c.json({
    "todos": JSON.stringify(await getTodosFromDB())
  })
})

const todoInsert = 'INSERT INTO todos (title) VALUES($1) RETURNING id'

app.post('/todos',
  sValidator('json', todoSchema, (result, c) => {
    if (!result.success) {
      const failedString = `Todo validation failed! ${result.error.flatMap(e => e.message).join(", ")}`
      console.log(failedString)
      return c.text(failedString, 400)
    }
    else console.log(`Todo validation successful.`)
  }),
  async (c) => {
    const todo = c.req.valid('json')
    const res_id = await pool.query(todoInsert, [todo.title])

    return c.text(res_id.rows[0]['id'], 201)
  }
)

//TODO
app.delete('/todos/:id', (c) =>
  c.text(`${c.req.param('id')} is deleted!`)
)

app.use((c) => {
  throw new HTTPException(401, { message: `The path "${c.req.path}" is not found` })
});

const server = serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server started in port ${info.port}`)
})

const onExit = async (exitvalue: number) => {
  await pool.end()
  process.exit(exitvalue)
}

// graceful shutdown
process.on('SIGINT', () => {
  server.close()
  onExit(0)
})
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      onExit(1)
    }
    onExit(0)
  })
})