"use client";

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';
import ChartWave from '@/components/ChartWave';
import ChartLines from '@/components/ChartLines';
import ActivityHeatmap from '@/components/ActivityHeatmap';

type Analytics = { instagram?: { followers?: number|string|null; engagement?: string|null; reach?: number|null }; youtube?: { subscribers?: number|string|null; watchTime?: string|null; views?: number|null } };
type ActivityItem = { _id?: string; id?: string; ts?: number; platform?: 'instagram'|'youtube'|string; type?: string; message?: string };

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [chart, setChart] = useState<number[]>([]);
  const [igFeed, setIgFeed] = useState<ActivityItem[]>([]);
  const [ytFeed, setYtFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [a, c, ig, yt] = await Promise.all([
          fetch(API_ENDPOINTS.analytics(), { cache: 'no-store' }).then(r => r.json()),
          fetch(API_ENDPOINTS.chartStatus(), { cache: 'no-store' }).then(r => r.json()),
          fetch(API_ENDPOINTS.activityFeed('instagram', 10), { cache: 'no-store' }).then(r => r.json()).catch(()=>({ items: [] })),
          fetch(API_ENDPOINTS.activityFeed('youtube', 10), { cache: 'no-store' }).then(r => r.json()).catch(()=>({ items: [] })),
        ]);
        setAnalytics(a || {});
        setChart((c?.series || c?.data || []) as number[]);
        setIgFeed((ig?.items as ActivityItem[]) || []);
        setYtFeed((yt?.items as ActivityItem[]) || []);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title vintage-accent">Analytics</h1>
        <p className="page-subtitle">Insights and performance metrics</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📊 Overview</h3>
          <div className="btn-grid">
            <div className="btn">IG Followers: {analytics?.instagram?.followers ?? '—'}</div>
            <div className="btn">IG Reach: {analytics?.instagram?.reach ?? '—'}</div>
            <div className="btn">YT Subscribers: {analytics?.youtube?.subscribers ?? '—'}</div>
            <div className="btn">YT Views: {analytics?.youtube?.views ?? '—'}</div>
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📈 Wave & Lines</h3>
          <ChartWave />
          <ChartLines points={chart} />
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🔥 Activity Heatmap</h3>
          <ActivityHeatmap />
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📰 Recent Activity (Instagram)</h3>
          <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.5rem' }}>
            {igFeed.map((it, idx) => (
              <div key={it._id || it.id || idx} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{opacity:0.9}}>{it.type || 'event'}</div>
                <div style={{opacity:0.7, marginLeft: 12, flex:1}}>{it.message || ''}</div>
                <div style={{opacity:0.6}}>{it.ts ? new Date(it.ts).toLocaleString() : ''}</div>
              </div>
            ))}
            {igFeed.length === 0 && <div style={{opacity:0.7}}>No recent activity</div>}
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📰 Recent Activity (YouTube)</h3>
          <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.5rem' }}>
            {ytFeed.map((it, idx) => (
              <div key={it._id || it.id || idx} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{opacity:0.9}}>{it.type || 'event'}</div>
                <div style={{opacity:0.7, marginLeft: 12, flex:1}}>{it.message || ''}</div>
                <div style={{opacity:0.6}}>{it.ts ? new Date(it.ts).toLocaleString() : ''}</div>
              </div>
            ))}
            {ytFeed.length === 0 && <div style={{opacity:0.7}}>No recent activity</div>}
          </div>
        </div>
      </div>
      {loading && <div style={{opacity:.7}}>Loading…</div>}
    </div>
  );
}
