import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { HTTPException} from 'hono/http-exception'
import { join } from 'path'
import { mkdir, createWriteStream, readFile } from 'fs'
import { pipeline } from 'stream/promises'
import { stat } from 'fs/promises'

const PORT = process.env.PORT || 3000

const app = new Hono().basePath('/api')
let appRunning = true

const public_directory = join('/', 'usr', 'src', 'app', 'public')
const image_directory = join(public_directory, 'images')
const imagePath = join(image_directory, 'image.jpg')

const stats = await stat(imagePath).catch(() => null)
let lastSaveTime = stats !== null ? stats.mtime.getTime() : 0
if(lastSaveTime === 0){
  await new Promise<void>(res => mkdir(image_directory, (err) => res()))
}
const timeSinceLastImageSave = () => Date.now() - lastSaveTime

async function waitImageSaved() {
  while(lastSaveTime === 0){
    await new Promise(r => setTimeout(r, 200));
  }
}

//app.use('/*', serveStatic({ root: public_directory }))
app.get('/image', async (c) => {
    await waitImageSaved()
    return c.text('ok')
})

app.get('/todos', (c) => {
  return c.json({
    "todos": [
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
  })
})

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