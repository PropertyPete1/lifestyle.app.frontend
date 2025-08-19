import YTMetricsClient from '@/components/YTMetricsClient';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">YT Metrics</h1>
      <YTMetricsClient />
    </main>
  );
}
"use client";

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import ChartLines from '@/components/ChartLines';

type Analytics = { instagram?: { followers?: number|string|null; engagement?: string|null; reach?: number|null }; youtube?: { subscribers?: number|string|null; watchTime?: string|null; views?: number|null } };
type ActivityItem = { _id?: string; id?: string; ts?: number; platform?: 'instagram'|'youtube'|string; type?: string; message?: string };

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [chart, setChart] = useState<number[]>([]);
  const [igFeed, setIgFeed] = useState<ActivityItem[]>([]);
  const [ytFeed, setYtFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<'instagram'|'youtube'>('instagram');
  const [series, setSeries] = useState<{ dates: string[]; postCounts: number[]; likeCounts: number[]; commentCounts: number[] }>({ dates: [], postCounts: [], likeCounts: [], commentCounts: [] });
  const [perHour, setPerHour] = useState<number[]>(Array.from({length:24},()=>0));
  const [perWeekday, setPerWeekday] = useState<number[]>(Array.from({length:7},()=>0));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [a, _c, ig, yt, s, h, w] = await Promise.all([
          fetch(API_ENDPOINTS.analytics(), { cache: 'no-store' }).then(r => r.json()),
          Promise.resolve({}),
          fetch(API_ENDPOINTS.activityFeed('instagram', 10), { cache: 'no-store' }).then(r => r.json()).catch(()=>({ items: [] })),
          fetch(API_ENDPOINTS.activityFeed('youtube', 10), { cache: 'no-store' }).then(r => r.json()).catch(()=>({ items: [] })),
          fetch(API_ENDPOINTS.analyticsSeries(platform, 30), { cache: 'no-store' }).then(r => r.json()).catch(()=>({ dates:[], postCounts:[], likeCounts:[], commentCounts:[] })),
          fetch(API_ENDPOINTS.analyticsPostsPerHour(platform), { cache: 'no-store' }).then(r => r.json()).catch(()=>({ hours: Array.from({length:24},()=>0) })),
          fetch(API_ENDPOINTS.analyticsPostsPerWeekday(platform), { cache: 'no-store' }).then(r => r.json()).catch(()=>({ weekdays: Array.from({length:7},()=>0) })),
        ]);
        setAnalytics(a || {});
        setChart((s?.postCounts || []) as number[]);
        setIgFeed((ig?.items as ActivityItem[]) || []);
        setYtFeed((yt?.items as ActivityItem[]) || []);
        setSeries(s || { dates: [], postCounts: [], likeCounts: [], commentCounts: [] });
        setPerHour(h?.hours || Array.from({length:24},()=>0));
        setPerWeekday(w?.weekdays || Array.from({length:7},()=>0));
      } finally { setLoading(false); }
    })();
  }, [platform]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title vintage-accent">Analytics</h1>
        <p className="page-subtitle">Insights and performance metrics</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🎯 Platform</h3>
          <div className="btn-grid">
            <button className={`btn btn-toggle ${platform==='instagram'?'active':''}`} onClick={()=>setPlatform('instagram')}>📷 Instagram</button>
            <button className={`btn btn-toggle ${platform==='youtube'?'active':''}`} onClick={()=>setPlatform('youtube')}>📺 YouTube</button>
          </div>
        </div>
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
          <h3 className="card-title">⭐ Optimal Times ({platform})</h3>
          <OptimalTimes platform={platform} />
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📆 Activity Series ({platform})</h3>
          <ChartLines igSeries={platform==='instagram'?series.postCounts:[]} ytSeries={platform==='youtube'?series.postCounts:[]} dates={series.dates} smoothing speedFactor={Math.max(0.5, Math.min(3, (series.postCounts.reduce((a,b)=>a+b,0)/(series.postCounts.length||1))/2))} />
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🕒 Posts by Hour ({platform})</h3>
          <div className="btn-grid" style={{ flexWrap:'wrap', gap:6 }}>
            {perHour.map((v,i)=>(<div key={i} className="btn" style={{ minWidth: 64 }}>h{i}: {v}</div>))}
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📅 Posts by Weekday ({platform})</h3>
          <div className="btn-grid">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=>(<div key={i} className="btn">{d}: {perWeekday[i]}</div>))}
          </div>
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

function OptimalTimes({ platform }: { platform: 'instagram'|'youtube' }) {
  const [best, setBest] = useState<{ day: string; hour: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.heatmapOptimal(platform), { cache: 'no-store' });
        const json = await res.json();
        setBest(json?.best || []);
      } finally { setLoading(false); }
    })();
  }, [platform]);
  return (
    <div className="btn-grid">
      {best.map((b, i) => (
        <div key={i} className="btn">{i+1}. {b.day} at {b.hour} — {b.count}</div>
      ))}
      {best.length === 0 && !loading && <div style={{opacity:0.7}}>No data</div>}
    </div>
  );
}
