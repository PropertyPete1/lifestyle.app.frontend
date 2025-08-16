'use client';
import React from 'react';

export default function ChartLines({ points = [] as number[] }) {
  const max = Math.max(1, ...points);
  return (
    <div style={{ position:'relative', height:100, display:'flex', alignItems:'flex-end', gap:10, marginTop:16 }}>
      <div style={{ position:'absolute', inset:0, background: 'repeating-linear-gradient(to top, rgba(255,255,255,.06), rgba(255,255,255,.06) 1px, transparent 1px, transparent 20px)', borderRadius:8 }} />
      {points.map((v, i) => (
        <div key={i} style={{ flex:1, background:'linear-gradient(180deg, rgba(0,255,136,.6), rgba(0,255,136,.05))', borderRadius:'6px 6px 0 0', height:`${(v/max)*100}%`, transition:'height .3s ease' }} />
      ))}
    </div>
  );
}

