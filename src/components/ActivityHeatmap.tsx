'use client';
import React from 'react';

export default function ActivityHeatmap({ matrix = [] as number[][] }) {
  const flat = (matrix.length ? matrix : Array.from({ length: 28 }, ()=>Math.floor(Math.random()*100))).flat();
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6 }}>
      {flat.map((v, i) => (
        <div key={i} style={{ width:'100%', paddingBottom:'100%', background:`rgba(0,255,136,${Math.min(0.85, (v||0)/100)})`, borderRadius:6 }} />
      ))}
    </div>
  );
}

