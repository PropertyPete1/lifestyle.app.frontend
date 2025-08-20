"use client";

import * as React from "react";

type QItem = {
  _id?: string;
  id?: string;
  platform: "instagram" | "youtube" | string;
  scheduledAt?: string; // ISO
  title?: string;
  source?: string;
  status?: string;
};

const API_BASE: string =
  (typeof window !== "undefined" && (window as unknown as { __API_BASE__?: string }).__API_BASE__) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

function isFuture(iso: string) {
  const t = Date.parse(iso);
  return Number.isFinite(t) && t >= Date.now() - 5000; // grace
}
function isSlot20(iso: string) {
  return iso.slice(14, 16) === "20";
}
function fmtCT(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Fetch failed ${r.status}`);
  return (await r.json()) as T;
}

export default function SchedulePanel(): React.ReactElement {
  const [items, setItems] = React.useState<QItem[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const [igResp, ytResp] = await Promise.all([
        fetchJSON<{ items?: QItem[] }>(
          `${API_BASE}/api/autopilot/queue?platform=instagram&scheduled=true&limit=50`
        ),
        fetchJSON<{ items?: QItem[] }>(
          `${API_BASE}/api/autopilot/queue?platform=youtube&scheduled=true&limit=50`
        ),
      ]);

      const ig = igResp?.items ?? [];
      const yt = ytResp?.items ?? [];
      const merged = [...ig, ...yt].filter(
        (it) => it && it.scheduledAt && isFuture(it.scheduledAt) && isSlot20(it.scheduledAt)
      );

      const seen = new Set<string>();
      const deduped: QItem[] = [];
      for (const it of merged) {
        const minuteKey = String(it.scheduledAt).slice(0, 16);
        const key = `${(it.platform || "").toLowerCase()}|${minuteKey}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(it);
        }
      }

      deduped.sort((a, b) =>
        String(a.scheduledAt).localeCompare(String(b.scheduledAt))
      );

      setItems(deduped);
    } catch (e: unknown) {
      setErr((e as Error)?.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return <div className="text-sm opacity-70">Loading…</div>;
  if (err) return <div className="text-sm text-red-500">Error: {err}</div>;

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-sm opacity-70">
          No upcoming :20 CT posts. (If it is :20 now, wait a few seconds.)
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200">
          {items.map((it, idx) => {
            const label = it.scheduledAt ? fmtCT(it.scheduledAt) : "";
            return (
              <li
                key={it._id || it.id || `${it.platform}-${idx}`}
                className="p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs border">
                    {String(it.platform || "").toUpperCase()}
                  </span>
                  <span className="text-sm">{label}</span>
                </div>
                <div className="text-sm opacity-70 truncate max-w-[60%]">
                  {it.title || it.source || it._id || it.id || ""}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
