import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { readFile } from 'fs'
import { join } from 'path'

const PORT = process.env.PORT || 3000

const app = new Hono()

app.use(async (c, next) => {
  if(c.req.path === '/health' || c.req.path === '/ready') {
    // Skip logging
    return await next()
  }

  //logger() is a middleware factory function, the output gets called with (c, next)
  return logger()(c, next)
})

const rootDirectory = join('/', 'usr', 'src', 'app')//'./'
const filesDirectory = join(rootDirectory, 'files')
const logFilePath = join(filesDirectory, 'log.txt')
const informationFilePath = join(rootDirectory, 'information.txt')

const request = async (url: string, options: RequestInit = {}) => {
  const req = new Request(url, options)
  let res = undefined
  try{
    res = await fetch(req)
  }
  catch (e){
    console.error(e)
    res = new Response(null, { status: 503, statusText: e !== null && e !== undefined ? e.toString() : "error" })
  }

  return res
}

const getFile = async (filePath: string) => new Promise<string>(res => {
  readFile(filePath, (err, data) => {
    if (err) res(`FAILED TO READ FILE ----------------  ${err}`)
    else res(data.toString())
  })
})

const getLastLine = (content: string) => {
  const lines = content.trim().split('\n')
  return lines[lines.length - 1]
}

app.get('/', async (c) => {
  const info = await getFile(informationFilePath)
  const log = getLastLine(await getFile(logFilePath))
  const res = await request(process.env.PING_PONG_APP_URL + process.env.PING_PONG_APP_PINGS_PATH)
  const pingpongs = res.ok ? await res.text() : 'Unable to get response'

  const resp = `file content: ${info}\nenv variable: MESSAGE=${process.env.MESSAGE}\n${log}.\nPing / Pongs: ${pingpongs}`

  return c.text(resp)
})

// Health check path
app.get('/health', (c) => {
  return c.text('Log output reader healthy.')
})

// Readiness check path
app.get('/ready', async (c) => {
  const res = await request(process.env.PING_PONG_APP_URL + process.env.PING_PONG_APP_READY_PATH)

  if (res.ok) {
    return c.text('Log output reader ready.')
  } else {
    return c.text('Ping-pong application not ready.', 503)
  }
})

const server = serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Reader started in port ${info.port}`)
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