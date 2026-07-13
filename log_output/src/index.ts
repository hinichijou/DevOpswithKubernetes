import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const PORT = process.env.PORT || 3000

const app = new Hono()

const generateRandomString = () => Math.random().toString(36).substr(2, 6)

const timeStamp = () => new Date().toISOString()

const randomString = generateRandomString()

const timeStampString = (outputString: string) => `${timeStamp()}: ${outputString}`

const output = (outputString: string) => {
  const stringWithTS = timeStampString(outputString)
  console.log(stringWithTS)
  setTimeout(() => output(outputString), 5000)
}

output(randomString)

app.get('/status', (c) => {
  return c.text(timeStampString(randomString))
})

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