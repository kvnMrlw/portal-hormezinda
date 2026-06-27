import http from 'node:http';

import { Server } from 'socket.io';

import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  const databaseConnection = connectDatabase();

  if (env.NODE_ENV === 'production') {
    await databaseConnection;
  }

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

  httpServer.listen(env.PORT, () => {
    console.log(`Portal Hormezinda API running on http://localhost:${env.PORT}/api`);
  });
}

void bootstrap();
