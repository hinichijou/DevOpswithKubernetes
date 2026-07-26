import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { HTTPException} from 'hono/http-exception'
import { sValidator } from '@hono/standard-validator'
import { readFile } from 'fs'
//import { cors } from 'hono/cors'

import { todoSchema, type Todo }  from './model.js'

const PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 3001
const API_PATH  = process.env.API_PATH || '/api'

const app = new Hono().basePath(API_PATH)
//This is not required if using the frontend as a proxy or routing through ingress
//app.use('/*', cors())

const TODOS_DEFAULTS_PATH = process.env.TODOS_DEFAULTS_PATH || "./config/todos.json"
const defaultTodos = async () => {
  return await new Promise<Array<Todo>>(res => { 
    readFile(TODOS_DEFAULTS_PATH, (err, data) => {
      if (err){
        res(
          [
            {
                "id": "0",
                "title": "Learn Kubernetes basics"
            },
            {
                "id": "1",
                "title": "Deploy application to cluster"
            },
            {
                "id": "2",
                "title": "Configure persistent volumes"
            }
          ]
        )
      }
      else {
        res(JSON.parse(data.toString()) as Array<Todo>)
      }
    })
  })
}

const receivedTodos = new Array<Todo>()

const getTodosList = async () => {
  const todos = await defaultTodos()
  return todos.concat(receivedTodos)
}

app.get('/todos', async (c) => {
  return c.json({
    "todos": JSON.stringify(await getTodosList())
  })
})

app.post('/todos',
  sValidator('json', todoSchema),
  async (c) => {
    const todo = c.req.valid('json')
    const todos = await getTodosList()
    const id = todos.length.toString()
    todos.push({"id": id, "title": todo.title})

    console.log(todos)

    return c.text(id, 201)
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