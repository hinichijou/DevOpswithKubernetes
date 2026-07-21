import express from 'express';

const app = express();

const PORT = 3000

let pingpongs = 0

app.get('/pingpong', (_req, res) => {
  res.send(pingpongs.toString());
  pingpongs++
});

app.get('/pings', (_req, res) => {
  res.send(pingpongs.toString());
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