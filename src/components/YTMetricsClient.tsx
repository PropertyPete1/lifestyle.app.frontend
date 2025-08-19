"use client";
import * as React from "react";

type Totals = {
  subscribers?: number;
  viewsLifetime?: number;
  viewsWindow?: number;
  watchTimeMinutesWindow?: number;
  subsGainedWindow?: number;
  subsLostWindow?: number;
};
type Resp = { ok: boolean; windowDays: number; totals?: Totals; error?: string; note?: string };

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function YTMetricsClient({ windowDays = 30 }: { windowDays?: number }) {
  const [data, setData] = React.useState<Resp | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API}/api/metrics/youtube?windowDays=${windowDays}`, { cache: 'no-store' });
        const j: Resp = await r.json();
        if (!alive) return;
        setData(j);
        setErr(j.ok ? null : (j.error || j.note || "Failed to load"));
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : 'Failed to load';
        setErr(msg);
      }
    })();
    return () => { alive = false; };
  }, [windowDays]);

  const t = data?.totals || {};
  return (
    <div className="rounded border border-gray-700/40 bg-black/20 p-3 space-y-2">
      <div className="text-base font-semibold">YT Metrics</div>
      {err ? (
        <div className="text-sm text-red-400">Error: {err}</div>
      ) : !data ? (
        <div className="text-sm opacity-70">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded bg-black/30 p-3">
            <div className="opacity-70">👥 Subscribers</div>
            <div className="text-lg font-bold">{t.subscribers ?? "—"}</div>
          </div>
          <div className="rounded bg-black/30 p-3">
            <div className="opacity-70">⏱ Watch Time (last {data.windowDays}d)</div>
            <div className="text-lg font-bold">{t.watchTimeMinutesWindow ?? "—"} min</div>
          </div>
          <div className="rounded bg-black/30 p-3">
            <div className="opacity-70">👁 Views (last {data.windowDays}d)</div>
            <div className="text-lg font-bold">{t.viewsWindow ?? "—"}</div>
          </div>
          <div className="rounded bg-black/30 p-3">
            <div className="opacity-70">📈 Lifetime Views</div>
            <div className="text-lg font-bold">{t.viewsLifetime ?? "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}


