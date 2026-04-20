import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import yaml from 'js-yaml';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import authRouter from './routes/auth.routes.js';
import menuRouter from './routes/menu.routes.js';
import bookingRouter from './routes/booking.routes.js';
import adminRouter from './routes/admin.routes.js';

const openApiPath = path.join(process.cwd(), 'src', 'docs', 'openapi.yaml');
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8')) as Record<string, unknown>;

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'istu_dwa_lb_2',
    api: '/api',
    health: '/health',
    adminLogin: '/login.html',
    adminPanel: '/admin.html',
    apiDocs: '/api-docs',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/api', authRouter);
app.use('/api', menuRouter);
app.use('/api', bookingRouter);
app.use('/api', adminRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(express.static(path.join(process.cwd(), 'public')));

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
