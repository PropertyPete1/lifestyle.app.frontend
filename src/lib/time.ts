import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
try { dayjs.extend(utc); } catch {}
try { dayjs.extend(tz); } catch {}

export type QueueItem = {
  id?: string;
  _id?: string;
  platform: 'instagram' | 'youtube' | string;
  status?: 'queued' | 'scheduled' | 'verifying' | 'publishing' | 'posted' | 'failed' | string;
  scheduledAt?: string; // ISO
  meta?: {
    originalScheduledAt?: string; // ISO
    visualHash?: string;
    retryAt?: string; // ISO
    verifyAttempts?: number;
    pendingLink?: boolean;
  };
};

export const displayIso = (q: QueueItem): string | undefined =>
  (q?.meta && typeof q.meta.originalScheduledAt === 'string' && q.meta.originalScheduledAt)
    || q?.scheduledAt;

export const formatLocal = (iso?: string): string => {
  if (!iso) return '—';
  try {
    return dayjs.tz(iso, dayjs.tz.guess()).format('MMM D, h:mm A z');
  } catch {
    return iso;
  }
};


