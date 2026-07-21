import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { readFile } from 'fs'
import { join } from 'path'

const PORT = process.env.PORT || 3000

const app = new Hono()

const directory = join('/', 'usr', 'src', 'app', 'files')//'./'
const logFilePath = join(directory, 'log.txt')

const request = async (url: string, options: RequestInit = {}) => {
  const req = new Request(url, options)
  const res = await fetch(req)

  return res
}

const getFile = async (filePath: string) => new Promise<string>(res => {
  readFile(filePath, (err, data) => {
    if (err) res(`FAILED TO READ FILE ----------------  ${err}`)
    res(data.toString())
  })
})

const getLastLine = (content: string) => {
  const lines = content.trim().split('\n')
  return lines[lines.length - 1]
}

app.get('/', async (c) => {
  const log = getLastLine(await getFile(logFilePath))
  const res = await request('http://pingpongapp-svc:2345/pings')
  const pingpongs = res.ok ? await res.text() : 'Unable to get response'

  return c.text(`${log}.\nPing / Pongs: ${pingpongs}`)
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