'use client';
import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';

export default function ActivityHeatmap() {
  const [data, setData] = useState<{ matrix: number[][] }>({ matrix: [] });
  useEffect(() => {
    (async () => {
      const res = await fetch(API_ENDPOINTS.heatmapWeekly());
      const json = await res.json();
      setData({ matrix: json.matrix || [] });
    })();
  }, []);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 6 }}>
      {data.matrix.flat().map((v, i) => (
        <div key={i} style={{
          width: '100%', paddingBottom: '100%',
          background: `rgba(0,200,255,${Math.min(0.85, v/100)})`,
          borderRadius: 6
        }} />
      ))}
    </div>
  );
}

