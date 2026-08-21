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

// 3.4: root is also the default health check path. I'm assuming the overlap is on purpose for now but would make to configure a dedicated path for the health check
app.get('/', async (_req, res) => {
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