import { SubmitClassAttendanceInput } from './attendance-types';

/**
 * SchoolOS Offline Attendance Queue Manager
 * Grounded in Playbook Chapters 7, 21 (p. 21, 63 R6)
 * Enables teachers to mark morning attendance offline during campus network outages.
 * Records are timestamped client-side and automatically synchronized when connectivity returns.
 */

export interface OfflineQueueItem {
  id: string;
  enqueuedAt: string;
  payload: SubmitClassAttendanceInput;
}

const STORAGE_KEY = 'schoolos_attendance_offline_queue_v1';
const SIMULATION_KEY = 'schoolos_offline_simulation_active';

// In-memory fallback for SSR or environments without localStorage
let inMemoryQueue: OfflineQueueItem[] = [];
let inMemorySimulation = false;

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isOfflineSimulationEnabled(): boolean {
  if (hasLocalStorage()) {
    return window.localStorage.getItem(SIMULATION_KEY) === 'true';
  }
  return inMemorySimulation;
}

export function setOfflineSimulationEnabled(enabled: boolean): void {
  if (hasLocalStorage()) {
    window.localStorage.setItem(SIMULATION_KEY, enabled ? 'true' : 'false');
  }
  inMemorySimulation = enabled;
}

export function getPendingOfflineQueue(): OfflineQueueItem[] {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [...inMemoryQueue];
}

export function enqueueOfflineAttendance(
  payload: SubmitClassAttendanceInput
): OfflineQueueItem {
  const item: OfflineQueueItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    enqueuedAt: new Date().toISOString(),
    payload: {
      ...payload,
      isOfflineSync: true,
      clientTimestamp: new Date().toISOString(),
    },
  };

  if (hasLocalStorage()) {
    try {
      const queue = getPendingOfflineQueue();
      queue.push(item);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
      inMemoryQueue.push(item);
    }
  } else {
    inMemoryQueue.push(item);
  }

  return item;
}

export function removeOfflineItem(id: string): void {
  if (hasLocalStorage()) {
    try {
      const queue = getPendingOfflineQueue().filter((q) => q.id !== id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
      inMemoryQueue = inMemoryQueue.filter((q) => q.id !== id);
    }
  } else {
    inMemoryQueue = inMemoryQueue.filter((q) => q.id !== id);
  }
}

export function clearOfflineQueue(): void {
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      inMemoryQueue = [];
    }
  }
  inMemoryQueue = [];
}

export async function flushOfflineQueue(
  syncHandler: (item: SubmitClassAttendanceInput) => Promise<{ success: boolean; error?: string }>
): Promise<{ totalFlushed: number; successCount: number; errors: string[] }> {
  const queue = getPendingOfflineQueue();
  let successCount = 0;
  const errors: string[] = [];

  for (const item of queue) {
    try {
      const res = await syncHandler(item.payload);
      if (res.success) {
        removeOfflineItem(item.id);
        successCount++;
      } else {
        errors.push(`Queue item ${item.id} sync failed: ${res.error || 'Server rejected'}`);
      }
    } catch (err: any) {
      errors.push(`Queue item ${item.id} error: ${err.message || 'Unknown network error'}`);
    }
  }

  return {
    totalFlushed: queue.length,
    successCount,
    errors,
  };
}
