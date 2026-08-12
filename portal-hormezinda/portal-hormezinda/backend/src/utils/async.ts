import { env } from '../config/env';

export function runSafely(promise: Promise<unknown>, context: string): void {
  promise.catch((error) => {
    if (env.NODE_ENV !== 'test') {
      console.error(`[async:${context}]`, error);
    }
  });
}
