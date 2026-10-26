import { Worker, Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from './queues';

console.log('Starting SchoolOS Background Worker Engine...');

export const financeWorker = new Worker(
  QUEUE_NAMES.FINANCE,
  async (job: Job) => {
    console.log(`[FinanceWorker] Processing job ${job.id}: ${job.name}`);
    return { success: true, processedAt: new Date().toISOString() };
  },
  { connection: redisConnection }
);

export const pdfWorker = new Worker(
  QUEUE_NAMES.PDF_RENDER,
  async (job: Job) => {
    console.log(`[PdfWorker] Processing PDF render job ${job.id}: ${job.name}`);
    return { success: true, pdfUrl: `https://storage.schoolos.ng/mock/${job.id}.pdf` };
  },
  { connection: redisConnection }
);

export const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job) => {
    console.log(`[NotificationWorker] Dispatching message for job ${job.id}`);
    return { success: true, delivered: true };
  },
  { connection: redisConnection }
);

console.log('SchoolOS Workers initialized and listening for jobs.');
