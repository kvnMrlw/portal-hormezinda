import http from 'node:http';

import { Server } from 'socket.io';

import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { ensureDefaultAdmin } from './seeds/ensureAdmin';
import { notificationEvents } from './modules/notifications/service/notification-events';

function logProcessError(type: string, error: unknown): void {
  console.error(`[${type}]`, error);
}

process.on('unhandledRejection', (reason) => {
  logProcessError('unhandledRejection', reason);
});

process.on('uncaughtException', (error) => {
  logProcessError('uncaughtException', error);
});

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

    const userId = typeof socket.handshake.auth?.userId === 'string' ? socket.handshake.auth.userId : undefined;

    if (userId) {
      void socket.join(`user:${userId}`);
    }
  });

  notificationEvents.on('notification', ({ notification, userId }) => {
    try {
      io.to(`user:${userId}`).emit('notification:new', notification);
    } catch (error) {
      logProcessError('notificationSocketEmit', error);
    }
  });

  httpServer.listen(env.PORT, () => {
    console.log(`Portal Hormezinda API running on http://localhost:${env.PORT}/api`);
  });

  httpServer.on('error', (error) => {
    logProcessError('httpServer', error);
  });
}

void bootstrap().catch((error) => {
  logProcessError('bootstrap', error);
});
