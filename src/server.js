require('dotenv').config();

const express = require('express');
const cors = require('cors');
const menuRouter = require('./routes/menu');
const bookingsRouter = require('./routes/bookings');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'istu_dwa_lb_2',
    api: '/api',
    health: '/health',
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', menuRouter);
app.use('/api', bookingsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
