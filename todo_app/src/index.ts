import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { join } from 'path'
import { mkdir, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { stat } from 'fs/promises'

const PORT = process.env.PORT || 3000

const app = new Hono()
let appRunning = true

const public_directory = join('/', 'usr', 'src', 'app', 'public')
const image_directory = join(public_directory, 'images')
const imagePath = join(image_directory, 'image.jpg')

const stats = await stat(imagePath).catch(() => null)
console.log(stats)
let lastSaveTime = stats !== null ? stats.mtime.getTime() : 0
console.log(lastSaveTime)
if(lastSaveTime === 0){
  await new Promise<void>(res => mkdir(image_directory, (err) => res()))
}
const timeSinceLastImageSave = () => Date.now() - lastSaveTime

console.log(timeSinceLastImageSave())

app.use('/', serveStatic({ root: './public' }))
app.use('/images/*', serveStatic({ root: public_directory }))

const getAndWriteImage = async () => {
  const options = {
    headers: {
      'Cache-Control': 'no-store',
    },
  };
  const req = new Request('https://picsum.photos/1200', options);
  const response = await fetch(req)

  if (response.ok && response.body != null){
    const writeStream = createWriteStream(imagePath)
    await pipeline(response.body, writeStream)
    writeStream.end()
    lastSaveTime = Date.now()
  }
}

async function findNewImageLoop() {
  while(appRunning){
    if(timeSinceLastImageSave() > 600000) {
      await getAndWriteImage()
    }

    await new Promise(r => setTimeout(r, 2000));
  }
}

findNewImageLoop()

const server = serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server started in port ${info.port}`)
})

const onExit = (exitvalue: number) => {
  appRunning = false
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