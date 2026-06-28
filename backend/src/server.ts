import http from 'node:http';

import { Server } from 'socket.io';

import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { ensureDefaultAdmin } from './seeds/ensureAdmin';
import { notificationEvents } from './modules/notifications/service/notification-events';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await ensureDefaultAdmin();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
  });

  notificationEvents.on('notification', ({ notification, userId }) => {
    io.to(`user:${userId}`).emit('notification:new', notification);
  });

  httpServer.listen(env.PORT, () => {
    console.log(`Portal Hormezinda API running on http://localhost:${env.PORT}/api`);
  });
}

void bootstrap();
