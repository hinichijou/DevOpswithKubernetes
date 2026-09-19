import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const PORT = process.env.PORT || 3000
const MESSAGE = process.env.MESSAGE || 'Hello from version 1'

const app = new Hono()

const closeAndExit = (exitvalue: number) => {
  server.close()
  onExit(exitvalue)
}

const onExit = async (exitvalue: number) => {
  process.exit(exitvalue)
}

app.use(async (c, next) => {
  if(c.req.path === '/health' || c.req.path === '/ready') {
    // Skip logging
    return await next()
  }

  //logger() is a middleware factory function, the output gets called with (c, next)
  return logger()(c, next)
})

app.get('/', (c) => {
  return c.text(MESSAGE)
})

// Health check path
app.get('/health', (c) => {
  return c.text('Greeter healthy.')
})

// Readiness check path
app.get('/ready', async (c) => {
  return c.text('Greeter ready.')
})

const server = serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Greeter started in port ${info.port}`)
})

// graceful shutdown
process.on('SIGINT', () => {
  closeAndExit(0)
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