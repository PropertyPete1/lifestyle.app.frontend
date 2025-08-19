import { DateTime } from "luxon";

export const APP_TZ = "America/Chicago";
export const SLOT_HOURS = [18, 19, 20, 21, 22];
export const SLOT_MINUTE = 20;

export function toLocal(dtIso: string) {
  return DateTime.fromISO(dtIso, { zone: "utc" }).setZone(APP_TZ);
}
export function isExactSlot(dtIso: string) {
  const dt = toLocal(dtIso);
  return SLOT_HOURS.includes(dt.hour) && dt.minute === SLOT_MINUTE;
}
export function fmtLocalLabel(dtIso: string) {
  return toLocal(dtIso).toFormat("h:mm a");
}
export function isFuture(dtIso: string) {
  const now = DateTime.now().setZone(APP_TZ);
  return toLocal(dtIso) > now;
}

export type QueueItem = { scheduledAt?: string; meta?: { originalScheduledAt?: string } };
export const displayIso = (q: QueueItem): string | undefined => (q?.meta?.originalScheduledAt || q?.scheduledAt);
export const formatLocal = (iso?: string): string => (iso ? toLocal(iso).toFormat('MMM d, h:mm a z') : '—');
