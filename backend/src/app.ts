import cors from 'cors';
import express from 'express';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import authRoutes from './modules/auth/routes/auth.routes';
import feedRoutes from './modules/feed/routes/feed.routes';
import noticeRoutes from './modules/notices/routes/notice.routes';
import userRoutes from './modules/users/routes/user.routes';
import healthRoutes from './routes/health.routes';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express.json({ limit: env.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.JSON_LIMIT }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'src/uploads')));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
