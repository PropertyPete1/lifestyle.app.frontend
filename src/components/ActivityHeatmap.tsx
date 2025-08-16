"use client";
import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';

export default function ActivityHeatmap() {
  const [matrix, setMatrix] = useState<number[][]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.heatmapWeekly(), { cache: 'no-store' });
        const json = await res.json();
        setMatrix(json.matrix || []);
      } catch {
        setMatrix(Array.from({ length: 4 }, () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 100))));
      }
    })();
  }, []);

  const flat = matrix.flat();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {flat.map((v, i) => (
        <div key={i} style={{ width: '100%', paddingBottom: '100%', background: `rgba(0,255,136,${Math.min(0.85, (v || 0) / 100)})`, borderRadius: 6 }} />
      ))}
    </div>
  );
}

