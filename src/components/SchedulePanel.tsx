"use client";
import React from "react";

type Platform = "instagram" | "youtube" | string;

interface QueueItem {
  _id?: string;
  id?: string;
  platform: Platform;
  scheduledAt?: string;
  title?: string;
  source?: string;
}

interface QueueResp {
  items?: QueueItem[];
  total?: number;
}

interface SchedStatus {
  tz: string;
  slots: string[];
}

const CT_TZ = "America/Chicago";
// NEXT_PUBLIC_API_URL is inlined at build; window.__API_BASE__ can override at runtime
const STATIC_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
function apiBase(): string {
  if (typeof window !== "undefined") {
    const w = window as unknown as { __API_BASE__?: string };
    if (w.__API_BASE__) return w.__API_BASE__!;
  }
  return STATIC_BASE;
}

async function getJSON<T>(path: string): Promise<T> {
  const base = apiBase();
  const url = base ? `${base}${path}` : path; // if base missing, assume same-origin
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

function parseUTC(iso: string): Date | null {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function isFuture(iso: string): boolean {
  const d = parseUTC(iso);
  return !!d && d.getTime() > Date.now();
}

// We want exact :20 *UTC minute* (because CT :20 maps to UTC :20 as well)
function isExactTwenty(iso: string): boolean {
  const d = parseUTC(iso);
  return !!d && d.getUTCMinutes() === 20;
}

function fmtCT(iso: string): string {
  const d = parseUTC(iso);
  if (!d) return iso;
  return d.toLocaleString(undefined, {
    timeZone: CT_TZ,
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SchedulePanel(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tz, setTz] = React.useState<string>("America/Chicago");
  const [slots, setSlots] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<QueueItem[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [sched, ig, yt] = await Promise.all([
        getJSON<SchedStatus>("/api/diag/schedule/status"),
        getJSON<QueueResp | QueueItem[]>("/api/autopilot/queue?platform=instagram&scheduled=true&limit=50"),
        getJSON<QueueResp | QueueItem[]>("/api/autopilot/queue?platform=youtube&scheduled=true&limit=50"),
      ]);

      const igItems = Array.isArray(ig) ? ig : ig.items ?? [];
      const ytItems = Array.isArray(yt) ? yt : yt.items ?? [];
      const merged = [...igItems, ...ytItems]
        .filter((x): x is QueueItem => !!x && typeof x === "object")
        .filter((x) => !!x.scheduledAt)
        .filter((x) => isFuture(String(x.scheduledAt)))
        .filter((x) => isExactTwenty(String(x.scheduledAt)));

      // Per platform+minute dedupe
      const seen = new Set<string>();
      const dedup: QueueItem[] = [];
      for (const it of merged) {
        const iso = new Date(String(it.scheduledAt)).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        const key = `${String(it.platform).toLowerCase()}|${iso}`;
        if (!seen.has(key)) {
          seen.add(key);
          dedup.push(it);
        }
      }
      dedup.sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));

      setTz(sched?.tz || "America/Chicago");
      setSlots(Array.isArray(sched?.slots) ? sched.slots : []);
      setItems(dedup);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    const id = setInterval(load, 45_000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <div className="text-sm opacity-70">Loading schedule…</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-80">
        TZ: <b>{tz}</b> • Slots: <b>{slots.join(", ")}</b>
      </div>
      {items.length === 0 ? (
        <div className="text-sm opacity-70">No upcoming :20 CT posts yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200">
          {items.map((it, idx) => {
            const key = it._id ?? it.id ?? String(idx);
            const when = fmtCT(String(it.scheduledAt));
            const label = it.title || it.source || key;
            return (
              <li key={key} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs border">{String(it.platform).toUpperCase()}</span>
                  <span className="text-sm">{when}</span>
                </div>
                <div className="text-sm opacity-70 truncate max-w-[60%]">{label}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
