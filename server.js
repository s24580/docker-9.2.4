const express = require('express');
const Redis = require('ioredis');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const redis = new Redis({
  host: 'redis',
  port: 6379
});

const pool = new Pool({
  user: 'user',
  host: 'postgres',
  database: 'testdb',
  password: 'password',
  port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );
`);

app.post('/messages', async (req, res) => {
  const { message } = req.body;
  await redis.lpush('messages', message);
  res.send('Message added');
});

app.get('/messages', async (req, res) => {
  const messages = await redis.lrange('messages', 0, -1);
  res.json(messages);
});

app.post('/users', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query('INSERT INTO users (name) VALUES ($1) RETURNING *', [name]);
  res.json(result.rows[0]);
});

app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
