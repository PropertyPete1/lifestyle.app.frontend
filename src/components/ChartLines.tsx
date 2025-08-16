// ✅ /frontend/components/ChartLines.tsx
'use client';
import React from 'react';
import './ChartLines.css';

export default function ChartLines({ points = [] as number[] }) {
  const max = Math.max(1, ...points);
  return (
    <div className="chart-container">
      <div className="chart-grid" />
      {points.map((v, i) => (
        <div key={i} className="chart-bar" style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}

