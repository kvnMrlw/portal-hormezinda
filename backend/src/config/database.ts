import mongoose from 'mongoose';

import { env } from './env';

const RETRY_DELAY_MS = 5000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB error:', error);
  });

  while (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
      });
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection failed. Retrying...', error);
      await wait(RETRY_DELAY_MS);
    }
  }
}
