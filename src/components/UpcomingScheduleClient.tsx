"use client";

import * as React from "react";
import { diagScheduleStatus, upcomingBoth } from "@/utils/api";
import { fmtLocalLabel, isExactSlot, isFuture } from "@/lib/time";

type Platform = "instagram" | "youtube" | string;

export type QItem = {
  _id?: string;
  id?: string;
  platform: Platform;
  scheduledAt?: string;
  source?: string;
  meta?: Record<string, unknown>;
  title?: string;
};

type ItemsShape = { items?: QItem[] } | QItem[];
type BothResp = { ig?: ItemsShape; yt?: ItemsShape };

function pick(listOrObj: ItemsShape | undefined): QItem[] {
  if (!listOrObj) return [];
  return Array.isArray(listOrObj) ? listOrObj : (listOrObj.items ?? []);
}

type SchedResp = {
  tz: string;
  slots: string[];
  upcomingUtc?: string[];
  upcomingLocal?: string[];
};

export default function UpcomingScheduleClient() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<SchedResp | null>(null);
  const [items, setItems] = React.useState<QItem[]>([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [sched, bothRaw] = await Promise.all([
          diagScheduleStatus(),
          upcomingBoth(50),
        ]);
        const both = bothRaw as unknown as BothResp;

        const ig = pick(both.ig);
        const yt = pick(both.yt);

        const list = [...ig, ...yt]
          .filter((it) => it && it.scheduledAt)
          .filter((it) => isExactSlot(String(it.scheduledAt)))
          .filter((it) => isFuture(String(it.scheduledAt)));

        const seen = new Set<string>();
        const deduped: QItem[] = [];
        for (const it of list) {
          const key = `${String(it.platform).toLowerCase()}|${new Date(String(it.scheduledAt)).toISOString().slice(0,16)}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(it);
          }
        }
        deduped.sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));

        if (!alive) return;
        setStatus(sched as SchedResp);
        setItems(deduped);
        setError(null);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || "Failed to load schedule");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="text-sm opacity-70">Loading schedule…</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-80">
        TZ: <b>{status?.tz || "America/Chicago"}</b> • Slots: <b>{(status?.slots || []).join(", ")}</b>
      </div>
      {items.length === 0 ? (
        <div className="text-sm opacity-70">No upcoming slot posts yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200">
          {items.map((it, idx) => (
            <li key={(it._id || it.id || String(idx))} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs border">{String(it.platform || "").toUpperCase()}</span>
                <span className="text-sm">{fmtLocalLabel(String(it.scheduledAt))}</span>
              </div>
              <div className="text-sm opacity-70 truncate max-w-[60%]">{it.title || it.source || (it._id || it.id) || ""}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


