import express from 'express';
import { Pool } from 'pg';
import morgan from 'morgan';

const app = express();
app.use(morgan('combined', {
  skip: (req, res) => {
    const probePath = req.originalUrl === '/health' || req.originalUrl === '/ready';
    return res.statusCode < 400 && probePath;
  }
}))

// Uses environment variables set for configuring the Postgres connection
const pool = new Pool();

pool.on('error', (err) => {
  console.error('Pg pool error!', err.message);
})

const PORT = 3000;

const getPings = async () => {
  const q_res = await pool.query('SELECT counter FROM pingpongs');
  return q_res.rows[0]['counter'];
}

const incrementPings = async () => {
  return await pool.query('UPDATE pingpongs SET counter = counter + 1');
}

app.get('/', async (_req, res) => {
  res.send(await getPings());
  await incrementPings();
});

app.get('/pings', async (_req, res) => {
   res.send(await getPings());
});

// Health check path
app.get('/health', (_req, res) => {
  res.send('Ping-pong application healthy.');
})

// Readiness check path
// It seems that the best way to check the postgres connection is to perform a cheap query.
// For example: https://github.com/brianc/node-postgres/issues/3208
app.get('/ready', async (_req, res) => {
  try {
    // Will throw if not successful
    await pool.query('SELECT 1');
    res.send('Ping-pong application ready.');
  } catch {
    res.status(503).send('Database connection not ready.');
  }
})

const server = app.listen(PORT, () => {
  console.log(`Pingin' n' Pongin' on port ${PORT}`);
});

const onExit = async (exitvalue) => {
  await pool.end();
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