import mongoose from 'mongoose';

import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    if (env.NODE_ENV === 'production') {
      console.error('MongoDB connection failed:', error);
      process.exit(1);
    }

    console.warn('MongoDB connection skipped in development:', error);
  }
}
