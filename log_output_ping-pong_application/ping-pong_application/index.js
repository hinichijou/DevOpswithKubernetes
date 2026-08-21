import express from 'express';
import { Client } from 'pg';

const app = express();
// Uses environment variables set for configuring the Postgres connection
const client = await new Client().connect();

const PORT = 3000;

const getPings = async () => {
  const q_res = await client.query('SELECT counter FROM pingpongs');
  return q_res.rows[0]['counter'];
}

const incrementPings = async () => {
  return await client.query('UPDATE pingpongs SET counter = counter + 1;');
}

// 3.2: Note that Ingress expects a service to give a successful response in the path / even if the service is mapped to some other path!
app.get('/', (_req, res) => {
  res.send('Ping pong application alive. Use path /pingpong to increment counter');
})

app.get('/pingpong', async (_req, res) => {
  res.send(await getPings());
  await incrementPings();
});

app.get('/pings', async (_req, res) => {
   res.send(await getPings());
});

const server = app.listen(PORT, () => {
  console.log(`Pingin' n' Pongin' on port ${PORT}`);
});

const onExit = (exitvalue) => {
    process.exit(exitvalue);
}

// graceful shutdown
process.on('SIGINT', () => {
  server.close();
  onExit(0);
})
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      onExit(1);
    }
    onExit(0);
  })
})