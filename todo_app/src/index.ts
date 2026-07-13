import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'

const PORT = process.env.PORT || 3000

const app = new Hono()

app.get('/', serveStatic({ path: './public/index.html'}))

const server = serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server started in port ${info.port}`)
})

// graceful shutdown
process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})