import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { createWriteStream } from 'fs'
import { access, mkdir } from 'fs/promises'
import { pipeline } from 'stream/promises'
import type { ReadableStream as WebReadableStream } from 'node:stream/web';

const PORT = process.env.PORT || 3000
const URL = process.env.URL || 'https://en.wikipedia.org/wiki/Kubernetes'
const FILE_DIR = process.env.FILE_DIR || 'static/'
const FILE_NAME = process.env.FILE_NAME || 'dummy.html'

const imagePath = `${FILE_DIR}/${FILE_NAME}`

const app = new Hono()

app.use(async (c, next) => {
  if(c.req.path === '/health' || c.req.path === '/ready') {
    // Skip logging
    return await next()
  }

  //logger() is a middleware factory function, the output gets called with (c, next)
  return logger()(c, next)
})

export const writeWebStream = async (res: Response) => {
  let saved = false
  if(res.body !== null){
    try {
      //Calling fsPromises.mkdir() when path is a directory that exists results in a rejection only when recursive is false.
      console.log(`Creating path ${FILE_DIR}`)
      await mkdir(`${FILE_DIR}`, { recursive: true });
      console.log(`Saving image to path ${FILE_DIR}`)
      const writeStream = createWriteStream(imagePath)
      await pipeline(res.body as WebReadableStream, writeStream)
      writeStream.end()
      saved = true
    }
    catch (e){
      console.error(`${e}`)
    }
  }

  return saved
}

export const checkContentExists = async () => {
  let exists = false
  try {
    console.log(`Checking existence of path ${imagePath}`)

    await access(imagePath)
    exists = true
  }
  catch (e){
    console.error(`${e}`)
  }

  return exists
}


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

const fetchContent = async () => {
  const res = await request(URL)
  // For some reason requesting content failed. Handle with a pod restart instead of retrying on server.
  if (!res.ok)
    closeAndExit(1)

  const saved = await writeWebStream(res)
  // For some reason saving content failed. Handle with a pod restart instead of retrying on server.
  if (!saved)
    closeAndExit(1)
}

await fetchContent()

app.get('/', serveStatic({ root: `${FILE_DIR}`, path: `${FILE_NAME}` }))

// Health check path
app.get('/health', (c) => {
  return c.text('Dummysite healthy.')
})

// Readiness check path
app.get('/ready', async (c) => {
  if (await checkContentExists()) {
    return c.text('Dummysite ready.')
  }
  else {
    return c.text('Dummysite not ready.', 503)
  }
})

const server = serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Dummysite started in port ${info.port}`)
})

const closeAndExit = (exitvalue: number) => {
  server.close()
  onExit(exitvalue)
}

const onExit = async (exitvalue: number) => {
  process.exit(exitvalue)
}

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