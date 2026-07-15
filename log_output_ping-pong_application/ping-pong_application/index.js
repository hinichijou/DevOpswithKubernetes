import express from 'express';

const app = express();

const PORT = 3000
let pingpongs = 0

app.get('/pingpong', (_req, res) => {
  res.send(pingpongs.toString());
  pingpongs++
});

app.listen(PORT, () => {
  console.log(`Pingin' n' Pongin' on port ${PORT}`);
});