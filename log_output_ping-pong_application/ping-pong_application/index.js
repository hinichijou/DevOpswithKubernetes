import express from 'express';
import { writeFileSync } from 'fs'
import { join } from 'path'

const app = express();

const PORT = 3000

const directory = join('/', 'usr', 'src', 'app', 'files')//'./'
const filePath = join(directory, 'pingpongs.txt')

let pingpongs = 0

const writePingPongs = () => writeFileSync(filePath, pingpongs.toString(), 'utf8')

writePingPongs()

app.get('/pingpong', (_req, res) => {
  res.send(pingpongs.toString());
  pingpongs++
  writePingPongs()
});

const server = app.listen(PORT, () => {
  console.log(`Pingin' n' Pongin' on port ${PORT}`);
});

const onExit = (exitvalue) => {
    writeStream.end()
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