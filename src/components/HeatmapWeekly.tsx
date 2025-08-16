'use client';
import React from 'react';

export default function HeatmapWeekly({
  matrix = [[]],
}: { matrix?: number[][] }) {
  const flat = matrix.flat();
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 6 }}>
      {flat.map((v, i) => (
        <div key={i} style={{
          width:'100%', paddingBottom:'100%',
          background: `rgba(0,200,255,${Math.min(0.85, v/100)})`,
          borderRadius: 6
        }} />
      ))}
    </div>
  );
}

