import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { HTTPException} from 'hono/http-exception'
import { sValidator } from '@hono/standard-validator'
//import { cors } from 'hono/cors'

import {todoSchema }  from './model.js'

const PORT = process.env.PORT || 3001

const app = new Hono().basePath('/api')
//This is not required if using the frontend as a proxy or routing through ingress
//app.use('/*', cors())

const todos = [
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

app.get('/todos', (c) => {
  return c.json({
    "todos": JSON.stringify(todos)
  })
})

app.post('/todos',
  sValidator('json', todoSchema),
  (c) => {
    const todo = c.req.valid('json')
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