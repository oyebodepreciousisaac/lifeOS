import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const QUEUE_NAMES = {
  FINANCE: 'finance-queue',
  PDF_RENDER: 'pdf-render-queue',
  NOTIFICATIONS: 'notifications-queue',
  ANALYTICS: 'analytics-queue',
  BACKUP: 'backup-queue',
} as const;

export const financeQueue = new Queue(QUEUE_NAMES.FINANCE, {
  connection: redisConnection,
});

export const pdfRenderQueue = new Queue(QUEUE_NAMES.PDF_RENDER, {
  connection: redisConnection,
});

export const notificationsQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
  connection: redisConnection,
});

export const analyticsQueue = new Queue(QUEUE_NAMES.ANALYTICS, {
  connection: redisConnection,
});

export const backupQueue = new Queue(QUEUE_NAMES.BACKUP, {
  connection: redisConnection,
});
