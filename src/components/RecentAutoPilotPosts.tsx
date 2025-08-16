'use client';
import React from 'react';

type RecentItem = { title?: string; caption?: string; id?: string; platform?: string; source?: string };

export default function RecentAutoPilotPosts({ items = [] as RecentItem[] }) {
  if (!items.length) return <div style={{ opacity:0.7 }}>No recent items yet.</div>;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:12 }}>
          <div style={{ fontWeight:600 }}>{it.title || it.caption || it.id || 'Item'}</div>
          <div style={{ fontSize:12, opacity:0.7 }}>{it.platform || it.source || 'queue'}</div>
        </div>
      ))}
    </div>
  );
}

