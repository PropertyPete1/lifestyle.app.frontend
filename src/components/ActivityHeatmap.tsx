"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';

type HeatmapData = { labels?: { rows?: string[]; cols?: string[] }; matrix: number[][]; max?: number; total?: number; windowDays?: number; platform?: string };

export default function ActivityHeatmap({ platform }: { platform?: 'instagram'|'youtube' }) {
  const [data, setData] = useState<HeatmapData>({ matrix: [] });
  useEffect(() => {
    (async () => {
      try {
        const url = `${API_ENDPOINTS.heatmapWeekly()}${platform?`?platform=${platform}`:''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        setData({ matrix: json.matrix || [], labels: json.labels, max: json.max, total: json.total, windowDays: json.windowDays, platform: json.platform });
      } catch {
        const rows = 7, cols = 24;
        setData({ matrix: Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0)) });
      }
    })();
  }, [platform]);

  const max = data.max || Math.max(1, ...data.matrix.flat());
  const colorFor = (v: number) => {
    const t = v <= 0 ? 0 : v / max; // 0..1
    const r = Math.round(20 + 235 * t);
    const g = Math.round(80 + 60 * t);
    const b = Math.round(120 - 80 * t);
    return `rgb(${r},${g},${b})`;
  };

  const legendStops = useMemo(() => [0, 0.25, 0.5, 0.75, 1], []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${data.matrix[0]?.length || 0}, 1fr)`, gap: 6, alignItems: 'center' }}>
        <div />
        {(data.labels?.cols || []).map((c, i) => (
          <div key={i} style={{ fontSize: 10, opacity: 0.7, textAlign: 'center' }}>{c}</div>
        ))}
        {(data.matrix || []).map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{data.labels?.rows?.[rIdx] ?? rIdx}</div>
            {row.map((v, cIdx) => (
              <div key={cIdx} title={`${data.labels?.rows?.[rIdx] || rIdx} @ ${data.labels?.cols?.[cIdx] || cIdx}: ${v}`}
                   style={{ width: '100%', paddingBottom: '100%', background: colorFor(v), borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Legend:</div>
        {legendStops.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 18, height: 10, background: colorFor(t * max), borderRadius: 3 }} />
            <div style={{ fontSize: 11, opacity: 0.7 }}>{Math.round(t * max)}</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>Window: {data.windowDays || 30}d · Total: {data.total ?? 0}</div>
      </div>
    </div>
  );
}

