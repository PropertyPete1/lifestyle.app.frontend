'use client';
import React, { useEffect, useState } from 'react';
import './ActivityHeatmap.css';
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
    <div className="heatmap">
      {data.matrix.flat().map((v, i) => (
        <div key={i} className="cell" style={{ background: `rgba(244,63,94,${Math.min(0.85, v/100)})` }} />
      ))}
    </div>
  );
}

