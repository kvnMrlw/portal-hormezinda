import { EventEmitter } from 'node:events';

import type { PublicNotification } from '../types/notification.types';

export const notificationEvents = new EventEmitter();

export function emitNotification(userId: string, notification: PublicNotification): void {
  notificationEvents.emit('notification', { notification, userId });
}
