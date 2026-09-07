import { Context, Hono, type Next } from 'hono'
import { serve } from '@hono/node-server'
import { HTTPException} from 'hono/http-exception'
import { sValidator } from '@hono/standard-validator'
import { logger } from 'hono/logger'
import { Pool } from 'pg'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { connect } from '@nats-io/transport-node'
//import { cors } from 'hono/cors'

import { createTodoSchema, updateTodoSchema, TodoSchemaFields, TodoTableName }  from './model.js'

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

export const bodyLogger = async (c: Context, next: Next) => {
  try {
    // Clone because the stream gets consumed if read
    console.log(`Request body: ${ await c.req.raw.clone().text()}`)
  } catch (e){
    console.error(`Error reading request body: ${ e }`)
  }

  await next()
}

app.post(bodyLogger)
app.put(bodyLogger)

// Uses Postgres environment variables set for configuring the connection
const pool = new Pool()

pool.on('error', (err) => {
  console.error('Pg pool error!', err.message)
})

const nc = await connect({
  servers: process.env.NATS_URL || 'nats://nats:4222',
}).catch((err) => {
  console.error(
    'Failed to connect to NATS. Messages will not be published.',
    err,
  )
})

const getTodosFromDB = async () => {
  const q_res = await pool.query(`SELECT ${TodoSchemaFields.ID}, ${TodoSchemaFields.TITLE}, ${TodoSchemaFields.DONE} FROM ${TodoTableName}`)
  return q_res.rows
}

const publishMessage = (message: string) => {
  console.log(`Publishing message: ${message}`)
  nc?.publish(process.env.SUBJECT, message)
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

type ResultType = ({ success: true; data: Object; } | { success: false; error: readonly StandardSchemaV1.Issue[]; data: Object; })
const todoValidationCallback = (result: ResultType, c: Context) => {
  if (!result.success) {
      const failedString = `Todo validation failed! ${result.error.flatMap(e => e.message).join(", ")}`
      console.log(failedString)
      return c.text(failedString, 400)
  }
  else console.log(`Todo validation successful.`)
}

const todoInsert = `INSERT INTO ${TodoTableName} (${TodoSchemaFields.TITLE}, ${TodoSchemaFields.DONE}) VALUES($1, $2) RETURNING ${TodoSchemaFields.ID}`

app.post('/todos',
  sValidator('json', createTodoSchema, todoValidationCallback),
  async (c) => {
    const todo = c.req.valid('json')
    const res_id = await pool.query(todoInsert, [todo.title, false])

    publishMessage(`New todo: ${todo.title}.`)

    return c.text(res_id.rows[0]['id'], 201)
  }
)

app.put('/todos/:id',
  sValidator('json', updateTodoSchema, todoValidationCallback),
  async (c) => {
    const todo = c.req.valid('json')
    const id = c.req.param('id')
    const todoKeys = Object.keys(todo)

    if (todoKeys.length > 0){
      const updates = []
      const values = []
      let updateMessage = ''
      for (const [i, [k, v]] of Object.entries(todo).entries()) {
        updates.push(`${k} = $${i + 1}`)
        values.push(v)
        updateMessage += i === 0 ? `${k}: ${v}` : `, ${k}: ${v}`
      }

      values.push(id)
      const todoUpdate = `UPDATE ${TodoTableName} SET ${updates.join(', ')} WHERE id = $${values.length}`

      console.log(`Updating todos: ${todoUpdate}`)

      try {
        await pool.query(todoUpdate, values)
        publishMessage(`Todo with id ${id} updated: ${updateMessage}.`)
        return c.text('Updated.', 201)
      }
      catch(e) {
        console.error(`Updating todos failed: ${e}`)
        return c.text(`Update failed: ${e}`, 503)
      }
    }
    else {
      console.error(`Updating todos failed`)
      return c.text('Update failed.', 400)
    }
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
  // drain() is also an option, see https://github.com/nats-io/nats.js/blob/main/core/README.md
  await nc?.close()
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