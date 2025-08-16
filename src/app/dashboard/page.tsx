'use client';

import React, { useEffect, useState } from 'react';
import ChartWave from '@/components/ChartWave';
import ChartLines from '@/components/ChartLines';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { API_ENDPOINTS } from '@/utils/api';

type Platform = 'instagram' | 'youtube';

export default function DashboardPage() {
  const [platform, setPlatform] = useState<Platform>('instagram');
  type Analytics = { instagram?: { followers?: number|string; engagement?: string|null; reach?: number|null }; youtube?: { subscribers?: number|string; watchTime?: string|null; views?: number|null } };
  type Status = { running?: boolean; limits?: { hourlyLimit?: number; dailyLimit?: number } };
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [status, setStatus] = useState<Status>({});
  const [chart, setChart] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [a, s, c] = await Promise.all([
          fetch(API_ENDPOINTS.analytics(), { cache: 'no-store' }).then(r => r.json()),
          fetch(API_ENDPOINTS.autopilotStatus(), { cache: 'no-store' }).then(r => r.json()),
          fetch(API_ENDPOINTS.chartStatus(), { cache: 'no-store' }).then(r => r.json()),
        ]);
        setAnalytics(a || {});
        setStatus(s || {});
        setChart((c?.series || c?.data || []) as number[]);
      } catch {
        setAnalytics({}); setStatus({}); setChart([]);
      } finally { setLoading(false); }
    })();
  }, [platform]);

  const followers = analytics?.instagram?.followers ?? '';
  const engagement = analytics?.instagram?.engagement ?? '';
  const reach = analytics?.instagram?.reach ?? '';
  const subs = analytics?.youtube?.subscribers ?? '';
  const watchTime = analytics?.youtube?.watchTime ?? '';
  const views = analytics?.youtube?.views ?? '';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title vintage-accent">Dashboard</h1>
        <p className="page-subtitle">Command center for your social media empire</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🎯 Social Platforms</h3>
          <div className="btn-grid">
            <button className={`btn btn-toggle ${platform==='instagram'?'active':''}`} onClick={() => setPlatform('instagram')}>📷 Instagram</button>
            <button className={`btn btn-toggle ${platform==='youtube'?'active':''}`} onClick={() => setPlatform('youtube')}>📺 YouTube</button>
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
          <h3 className="card-title">⚡ Quick Actions</h3>
          <div className="btn-grid">
            <button className="btn btn-primary" disabled={posting} onClick={async ()=>{
              try {
                setPosting(true);
                await fetch(API_ENDPOINTS.postNow(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform, scope:'next' }) });
              } finally {
                setPosting(false);
              }
            }}>🚀 Post Now ({platform})</button>
            <a className="btn" href="/autopilot">Open AutoPilot</a>
          </div>
        </div>
        {platform==='instagram' ? (
          <div className="dashboard-card vintage-accent">
            <h3 className="card-title">📊 IG Metrics</h3>
            <div className="btn-grid">
              <div className="btn">👥 Followers: {followers}</div>
              <div className="btn">❤️ Engagement: {engagement}</div>
              <div className="btn">📣 Reach: {reach}</div>
            </div>
          </div>
        ) : (
          <div className="dashboard-card vintage-accent">
            <h3 className="card-title">📺 YT Metrics</h3>
            <div className="btn-grid">
              <div className="btn">👥 Subscribers: {subs}</div>
              <div className="btn">⏱ Watch Time: {watchTime}</div>
              <div className="btn">👁️ Views: {views}</div>
            </div>
          </div>
        )}
      </div>
      {loading && <div style={{opacity:.7}}>Loading…</div>}
    </div>
  );
}
