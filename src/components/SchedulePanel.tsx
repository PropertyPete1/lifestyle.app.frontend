"use client";
import * as React from 'react';
import { DateTime } from 'luxon';

type Platform = 'instagram' | 'youtube';
type ItemStatus = 'scheduled' | 'posted' | 'verifying' | 'failed' | 'publishing' | 'queued';

interface QueueItem {
  _id: string;
  platform: Platform;
  scheduledAt: string;
  title?: string;
  source?: string;
  status: ItemStatus;
}

interface QueueResp {
  items: QueueItem[];
  total?: number;
  limit?: number;
}

interface ScheduleStatus {
  tz: string;
  slots: string[];
  upcomingUtc?: string[];
  upcomingLocal?: string[];
}

const API_BASE: string =
  (typeof window !== 'undefined' && (window as unknown as { __API_BASE__?: string })?.__API_BASE__) ||
  process.env.NEXT_PUBLIC_API_URL ||
  '';

async function getJSON<T>(path: string): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

function fmtCT(iso: string): string {
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt.toFormat('ccc, L/d @ h:mm a');
}
function slotKeyCT(iso: string): string {
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt.toFormat('yyyy-LL-dd HH:mm');
}
function isMinute20CT(iso: string): boolean {
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt.minute === 20;
}
function isFutureCT(iso: string): boolean {
  const now = DateTime.now().setZone('America/Chicago');
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt > now;
}

export default function SchedulePanel(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sched, setSched] = React.useState<ScheduleStatus | null>(null);
  const [slots, setSlots] = React.useState<
    { key: string; label: string; ig?: QueueItem; yt?: QueueItem }[]
  >([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [status, ig, yt] = await Promise.all([
          getJSON<ScheduleStatus>('/api/diag/schedule/status'),
          getJSON<QueueResp>('/api/autopilot/queue?platform=instagram&scheduled=true&limit=50'),
          getJSON<QueueResp>('/api/autopilot/queue?platform=youtube&scheduled=true&limit=50'),
        ]);

        const candidates: QueueItem[] = [
          ...(ig.items || []),
          ...(yt.items || []),
        ].filter((q) => q.scheduledAt);

        const filtered = candidates.filter(
          (q) => isMinute20CT(q.scheduledAt) && isFutureCT(q.scheduledAt)
        );

        const map = new Map<
          string,
          { key: string; label: string; ig?: QueueItem; yt?: QueueItem }
        >();
        for (const q of filtered) {
          const key = slotKeyCT(q.scheduledAt);
          const entry = map.get(key) || { key, label: fmtCT(q.scheduledAt) };
          if (q.platform === 'instagram') entry.ig = q;
          if (q.platform === 'youtube') entry.yt = q;
          map.set(key, entry);
        }

        const list = Array.from(map.values())
          .sort((a, b) => a.key.localeCompare(b.key))
          .slice(0, 10);

        if (!cancelled) {
          setSched(status);
          setSlots(list);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load schedule';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-sm opacity-70">Loading…</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-80">
        TZ: <b>{sched?.tz ?? 'America/Chicago'}</b> • Slots:{' '}
        <b>{(sched?.slots ?? []).join(', ')}</b>
      </div>

      {slots.length === 0 ? (
        <div className="text-sm opacity-70">No upcoming :20 CT posts found.</div>
      ) : (
        <div className="rounded border border-gray-200 divide-y divide-gray-200">
          {slots.map((s) => (
            <div key={s.key} className="p-3 flex items-center justify-between">
              <div className="font-medium">{s.label}</div>
              <div className="flex gap-3 items-center text-xs">
                <span className="px-2 py-1 border rounded">
                  IG: {s.ig ? (s.ig.title || s.ig.source || s.ig._id) : '—'}
                </span>
                <span className="px-2 py-1 border rounded">
                  YT: {s.yt ? (s.yt.title || s.yt.source || s.yt._id) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import * as React from 'react';
import { DateTime } from 'luxon';

type Platform = 'instagram' | 'youtube';
type ItemStatus = 'scheduled' | 'posted' | 'verifying' | 'failed' | 'publishing' | 'queued';

interface QueueItem {
  _id: string;
  platform: Platform;
  scheduledAt: string;
  title?: string;
  source?: string;
  status: ItemStatus;
}

interface QueueResp {
  items: QueueItem[];
  total?: number;
  limit?: number;
}

interface ScheduleStatus {
  tz: string;
  slots: string[];
  upcomingUtc?: string[];
  upcomingLocal?: string[];
}

const API_BASE: string =
  (typeof window !== 'undefined' && (window as unknown as { __API_BASE__?: string })?.__API_BASE__) ||
  process.env.NEXT_PUBLIC_API_URL ||
  '';

async function getJSON<T>(path: string): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

function fmtCT(iso: string): string {
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt.toFormat('ccc, L/d @ h:mm a');
}
function slotKeyCT(iso: string): string {
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt.toFormat('yyyy-LL-dd HH:mm');
}
function isMinute20CT(iso: string): boolean {
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt.minute === 20;
}
function isFutureCT(iso: string): boolean {
  const now = DateTime.now().setZone('America/Chicago');
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
  return dt > now;
}

export default function SchedulePanel(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sched, setSched] = React.useState<ScheduleStatus | null>(null);
  const [slots, setSlots] = React.useState<
    { key: string; label: string; ig?: QueueItem; yt?: QueueItem }[]
  >([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [status, ig, yt] = await Promise.all([
          getJSON<ScheduleStatus>('/api/diag/schedule/status'),
          getJSON<QueueResp>('/api/autopilot/queue?platform=instagram&scheduled=true&limit=50'),
          getJSON<QueueResp>('/api/autopilot/queue?platform=youtube&scheduled=true&limit=50'),
        ]);

        const candidates: QueueItem[] = [
          ...(ig.items || []),
          ...(yt.items || []),
        ].filter((q) => q.scheduledAt);

        const filtered = candidates.filter(
          (q) => isMinute20CT(q.scheduledAt) && isFutureCT(q.scheduledAt)
        );

        const map = new Map<
          string,
          { key: string; label: string; ig?: QueueItem; yt?: QueueItem }
        >();
        for (const q of filtered) {
          const key = slotKeyCT(q.scheduledAt);
          const entry = map.get(key) || { key, label: fmtCT(q.scheduledAt) };
          if (q.platform === 'instagram') entry.ig = q;
          if (q.platform === 'youtube') entry.yt = q;
          map.set(key, entry);
        }

        const list = Array.from(map.values())
          .sort((a, b) => a.key.localeCompare(b.key))
          .slice(0, 10);

        if (!cancelled) {
          setSched(status);
          setSlots(list);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load schedule';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-sm opacity-70">Loading…</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-80">
        TZ: <b>{sched?.tz ?? 'America/Chicago'}</b> • Slots:{' '}
        <b>{(sched?.slots ?? []).join(', ')}</b>
      </div>

      {slots.length === 0 ? (
        <div className="text-sm opacity-70">No upcoming :20 CT posts found.</div>
      ) : (
        <div className="rounded border border-gray-200 divide-y divide-gray-200">
          {slots.map((s) => (
            <div key={s.key} className="p-3 flex items-center justify-between">
              <div className="font-medium">{s.label}</div>
              <div className="flex gap-3 items-center text-xs">
                <span className="px-2 py-1 border rounded">
                  IG: {s.ig ? (s.ig.title || s.ig.source || s.ig._id) : '—'}
                </span>
                <span className="px-2 py-1 border rounded">
                  YT: {s.yt ? (s.yt.title || s.yt.source || s.yt._id) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
type Platform = 'instagram' | 'youtube';
type ItemStatus = 'scheduled' | 'posted' | 'verifying' | 'failed' | 'publishing' | 'queued';

interface QueueItem {
	_id: string;
	platform: Platform;
	scheduledAt: string;
	title?: string;
	source?: string;
	status: ItemStatus;
}

interface QueueResp {
	items: QueueItem[];
	total?: number;
	limit?: number;
}

interface ScheduleStatus {
	tz: string;
	slots: string[];
	upcomingUtc?: string[];
	upcomingLocal?: string[];
}

const API_BASE: string =
	(typeof window !== 'undefined' && (window as unknown as { __API_BASE__?: string })?.__API_BASE__) ||
	process.env.NEXT_PUBLIC_API_URL ||
	'';

async function getJSON<T>(path: string): Promise<T> {
	const url = API_BASE ? `${API_BASE}${path}` : path;
	const res = await fetch(url, { cache: 'no-store' });
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`GET ${path} failed: ${res.status} ${text}`);
	}
	return (await res.json()) as T;
}

function fmtCT(iso: string): string {
	const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
	return dt.toFormat('ccc, L/d @ h:mm a');
}
function slotKeyCT(iso: string): string {
	const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
	return dt.toFormat('yyyy-LL-dd HH:mm');
}
function isMinute20CT(iso: string): boolean {
	const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
	return dt.minute === 20;
}
function isFutureCT(iso: string): boolean {
	const now = DateTime.now().setZone('America/Chicago');
	const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/Chicago');
	return dt > now;
}

export default function SchedulePanel(): React.ReactElement {
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [sched, setSched] = React.useState<ScheduleStatus | null>(null);
	const [slots, setSlots] = React.useState<
		{ key: string; label: string; ig?: QueueItem; yt?: QueueItem }[]
	>([]);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				setLoading(true);
				setError(null);

				const [status, ig, yt] = await Promise.all([
					getJSON<ScheduleStatus>('/api/diag/schedule/status'),
					getJSON<QueueResp>('/api/autopilot/queue?platform=instagram&scheduled=true&limit=50'),
					getJSON<QueueResp>('/api/autopilot/queue?platform=youtube&scheduled=true&limit=50'),
				]);

				const candidates: QueueItem[] = [
					...(ig.items || []),
					...(yt.items || []),
				].filter((q) => q.scheduledAt);

				const filtered = candidates.filter(
					(q) => isMinute20CT(q.scheduledAt) && isFutureCT(q.scheduledAt)
				);

				const map = new Map<
					string,
					{ key: string; label: string; ig?: QueueItem; yt?: QueueItem }
				>();
				for (const q of filtered) {
					const key = slotKeyCT(q.scheduledAt);
					const entry = map.get(key) || { key, label: fmtCT(q.scheduledAt) };
					if (q.platform === 'instagram') entry.ig = q;
					if (q.platform === 'youtube') entry.yt = q;
					map.set(key, entry);
				}

				const list = Array.from(map.values())
					.sort((a, b) => a.key.localeCompare(b.key))
					.slice(0, 10);

				if (!cancelled) {
					setSched(status);
					setSlots(list);
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Failed to load schedule';
				if (!cancelled) setError(msg);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) return <div className="text-sm opacity-70">Loading…</div>;
	if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

	return (
		<div className="space-y-3">
			<div className="text-sm opacity-80">
				TZ: <b>{sched?.tz ?? 'America/Chicago'}</b> • Slots:{' '}
				<b>{(sched?.slots ?? []).join(', ')}</b>
			</div>

			{slots.length === 0 ? (
				<div className="text-sm opacity-70">No upcoming :20 CT posts found.</div>
			) : (
				<div className="rounded border border-gray-200 divide-y divide-gray-200">
					{slots.map((s) => (
						<div key={s.key} className="p-3 flex items-center justify-between">
							<div className="font-medium">{s.label}</div>
							<div className="flex gap-3 items-center text-xs">
								<span className="px-2 py-1 border rounded">
									IG: {s.ig ? (s.ig.title || s.ig.source || s.ig._id) : '—'}
								</span>
								<span className="px-2 py-1 border rounded">
									YT: {s.yt ? (s.yt.title || s.yt.source || s.yt._id) : '—'}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}


