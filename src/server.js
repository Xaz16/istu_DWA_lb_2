require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const yaml = require('js-yaml');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const menuRouter = require('./routes/menu');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

const openApiSpec = yaml.load(
  fs.readFileSync(path.join(__dirname, 'docs', 'openapi.yaml'), 'utf8')
);

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'istu_dwa_lb_2',
    api: '/api',
    health: '/health',
    adminLogin: '/login.html',
    adminPanel: '/admin.html',
    apiDocs: '/api-docs',
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', authRouter);
app.use('/api', menuRouter);
app.use('/api', bookingsRouter);
app.use('/api', adminRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(express.static(path.join(__dirname, '..', 'public')));

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
