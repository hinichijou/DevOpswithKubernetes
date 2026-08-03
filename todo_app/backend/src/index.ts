import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { HTTPException} from 'hono/http-exception'
import { sValidator } from '@hono/standard-validator'
import { Client } from 'pg'
//import { cors } from 'hono/cors'

import { todoSchema, type Todo }  from './model.js'

const PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 3001
const API_PATH  = process.env.API_PATH || '/api'

const app = new Hono().basePath(API_PATH)
//This is not required if using the frontend as a proxy or routing through ingress
//app.use('/*', cors())

// Uses Postgres environment variables set for configuring the connection
const client = await new Client().connect()

const getTodosFromDB = async () => {
  const q_res = await client.query('SELECT id, title FROM todos')
  return q_res.rows
}

app.get('/todos', async (c) => {
  return c.json({
    "todos": JSON.stringify(await getTodosFromDB())
  })
})

const todoInsert = 'INSERT INTO todos (title) VALUES($1) RETURNING id'

app.post('/todos',
  sValidator('json', todoSchema),
  async (c) => {
    const todo = c.req.valid('json')
    const res_id = await client.query(todoInsert, [todo.title])

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

const onExit = (exitvalue: number) => {
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