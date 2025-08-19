"use client";

import * as React from "react";
import { diagScheduleStatus, upcomingBoth } from "@/utils/api";
import { fmtLocalLabel, isExactSlot, isFuture } from "@/lib/time";

type QItem = {
  _id?: string;
  id?: string;
  platform: "instagram" | "youtube" | string;
  scheduledAt?: string;
  source?: string;
  meta?: Record<string, any>;
  title?: string;
};

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
        const [sched, both] = await Promise.all([
          diagScheduleStatus(),
          upcomingBoth(50),
        ]);

        const ig: QItem[] = (both as any)?.ig?.items || (both as any)?.ig || [];
        const yt: QItem[] = (both as any)?.yt?.items || (both as any)?.yt || [];

        const list = [...ig, ...yt]
          .filter(Boolean)
          .filter((it) => it?.scheduledAt)
          .filter((it) => isExactSlot(String(it.scheduledAt)))
          .filter((it) => isFuture(String(it.scheduledAt)));

        const seen = new Set<string>();
        const deduped: QItem[] = [];
        for (const it of list) {
          const key = `${(it.platform || "").toString().toLowerCase()}|${new Date(String(it.scheduledAt)).toISOString().slice(0,16)}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(it);
          }
        }
        deduped.sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));

        if (!alive) return;
        setStatus(sched);
        setItems(deduped);
        setError(null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load schedule");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
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
