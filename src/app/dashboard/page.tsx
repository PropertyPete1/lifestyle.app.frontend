'use client';

import '../globals.css';
import '@/components/dashboard/DashboardStyles.css';
import '@/components/ChartWave.css';
import '@/components/ChartLines.css';
import '@/components/ActivityHeatmap.css';
import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';
import ChartWave from '@/components/ChartWave';
import ChartLines from '@/components/ChartLines';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import RecentAutoPilotPostsWrapper from '@/components/RecentAutoPilotPostsWrapper';
import { toast } from '@/components/NotificationSystem';

type Platform = 'instagram' | 'youtube';

type Limits = { hourlyLimit?: number; dailyLimit?: number };
type LockInfo = { held?: boolean; holder?: string };
type Status = { running?: boolean; limits?: Limits; lock?: LockInfo };
type Settings = {
  postTime?: string;
  repostDelay?: number;
  recentPostsToCheck?: number;
  visualSimilarityRecentPosts?: number;
  timeZone?: string;
  minimumIGLikesToRepost?: number;
  minViews?: number;
};
type Analytics = {
  instagram?: { followers?: number | string; engagement?: number | string; reach?: number | string };
  youtube?: { subscribers?: number | string; watchTime?: number | string; views?: number | string };
};
type QueueItem = {
  id?: string;
  platform?: Platform;
  title?: string;
  caption?: string;
  source?: string;
  scheduledAt?: string | null;
};

export default function DashboardPage() {
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [showCombined, setShowCombined] = useState(true);
  const [showIG, setShowIG] = useState(true);
  const [showYT, setShowYT] = useState(true);
  const [showRecent, setShowRecent] = useState(true);

  const [settings, setSettings] = useState<Settings>({});
  const [status, setStatus] = useState<Status>({});
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [chart, setChart] = useState<number[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // load + save toggles
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedPlatform = (localStorage.getItem('activePlatform') as Platform) || 'instagram';
    setPlatform(savedPlatform);
    setShowCombined(localStorage.getItem('showCombined') !== '0');
    setShowIG(localStorage.getItem('showIG') !== '0');
    setShowYT(localStorage.getItem('showYT') !== '0');
    setShowRecent(localStorage.getItem('showRecent') !== '0');
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('activePlatform', platform); }, [platform]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('showCombined', showCombined ? '1' : '0'); }, [showCombined]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('showIG', showIG ? '1' : '0'); }, [showIG]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('showYT', showYT ? '1' : '0'); }, [showYT]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('showRecent', showRecent ? '1' : '0'); }, [showRecent]);

  const refreshAllForPlatform = async (p: Platform) => {
    try {
      const [sRes, stRes, aRes, cRes, qRes] = await Promise.all([
        fetch(API_ENDPOINTS.settings(), { cache:'no-store' }),
        fetch(API_ENDPOINTS.autopilotStatus(), { cache:'no-store' }),
        fetch(API_ENDPOINTS.analytics(), { cache:'no-store' }),
        fetch(API_ENDPOINTS.chartStatus(), { cache:'no-store' }),
        fetch(API_ENDPOINTS.autopilotQueue(p, 50), { cache:'no-store' })
      ]);

      setSettings(await sRes.json());
      setStatus(await stRes.json());
      const a = await aRes.json();
      setAnalytics(a);

      const c = await cRes.json();
      setChart(c?.series || c?.data || []);

      const q = await qRes.json();
      setQueue((q?.items || q?.queue || []) as QueueItem[]);
    } catch (e) {
      console.error('refreshAllForPlatform error', e);
    }
  };

  useEffect(() => { refreshAllForPlatform(platform); }, [platform]);

  const handlePostNow = async (scope: 'next'|'all' = 'next', closeDrawer?: boolean) => {
    try {
      const res = await fetch(API_ENDPOINTS.postNow(), {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ platform, scope })
      });
      const json = await res.json();
      toast.show(json?.message || 'Post triggered');
      if (closeDrawer) setDrawerOpen(false);
      refreshAllForPlatform(platform);
    } catch {
      toast.show('Failed to post now');
    }
  };

  const statsIG = analytics?.instagram || {};
  const statsYT = analytics?.youtube || {};
  const followers = statsIG?.followers ?? '';
  const engagement = statsIG?.engagement ?? '';
  const reach = statsIG?.reach ?? '';
  const subs = statsYT?.subscribers ?? '';
  const watchTime = statsYT?.watchTime ?? '';
  const views = statsYT?.views ?? '';

  return (
    <div className="container">
      {/* Header */}
      <div className="toolbar" style={{ justifyContent:'space-between', marginBottom: 20 }}>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => setPlatform('instagram')} style={{
            padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)',
            background: platform==='instagram' ? 'rgba(0,200,255,0.15)' : 'transparent', color:'#fff'
          }}>Instagram</button>
          <button onClick={() => setPlatform('youtube')} style={{
            padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)',
            background: platform==='youtube' ? 'rgba(0,200,255,0.15)' : 'transparent', color:'#fff'
          }}>YouTube</button>
        </div>

        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => setDrawerOpen(true)} style={{ padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff' }}>🔁 View Smart Queue</button>
          <button onClick={() => setShowRecent(!showRecent)} style={{ padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff' }}>
            {showRecent ? 'Hide Recent' : 'Show Recent'}
          </button>
          <button onClick={() => handlePostNow('next')} style={{ padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(34,197,94,0.2)', color:'#fff' }}>⚡ Post Now</button>
          <a href="/autopilot" style={{ padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)' }}>AutoPilot Dashboard</a>
          <a href="/settings" style={{ padding:'10px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)' }}>Settings</a>
        </div>
      </div>

      {/* Metric tiles */}
      {platform==='instagram' ? (
        <div className="metrics-row">
          <Tile title="👥 Followers" value={followers} sub="Connected / Not Connected" />
          <Tile title="❤️ Engagement Rate" value={engagement} sub="↗ +0.8% from last post" />
          <Tile title="📊 Reach" value={reach} sub="↗ +12.4% today" />
          <Tile title="Auto-Post Status" value={`${status?.limits?.dailyLimit ?? ''}/day`} sub={`Next post at ${settings?.postTime ?? '--:--'} CT (delay: ${settings?.repostDelay ?? 1}d)`} pill={status?.running ? 'Active' : 'Inactive'} />
        </div>
      ) : (
        <div className="metrics-row">
          <Tile title="📺 Subscribers" value={subs} sub="Connected / Not Connected" />
          <Tile title="⏱️ Watch Time" value={watchTime} sub="↗ +15.7% hours this week" />
          <Tile title="👁️ Views" value={views} sub="↗ +8.3% this week" />
          <Tile title="Auto-Upload" value={`${status?.limits?.dailyLimit ?? ''}/day`} sub={`Next upload at ${settings?.postTime ?? '--:--'} CT (delay: ${settings?.repostDelay ?? 1}d)`} pill={status?.running ? 'Active' : 'Inactive'} />
        </div>
      )}

      {/* Toggles for charts */}
      <div style={{ display:'flex', gap:18, alignItems:'center', margin:'10px 0 6px' }}>
        <label><input type="checkbox" checked={showCombined} onChange={e=>setShowCombined(e.target.checked)} /> Combined</label>
        <label><input type="checkbox" checked={showIG} onChange={e=>setShowIG(e.target.checked)} /> IG</label>
        <label><input type="checkbox" checked={showYT} onChange={e=>setShowYT(e.target.checked)} /> YT</label>
      </div>

      {/* Charts */}
      <div className="wave-panel">
        <ChartWave />
        <ChartLines points={chart || []} />
        <div className="particles" />
      </div>

      {/* Heatmap */}
      <div className="heatmap-panel">
        <h3 style={{ marginTop:0 }}>Activity Heatmap</h3>
        <ActivityHeatmap />
      </div>

      {/* Recent */}
      {showRecent && (
        <div className="recent-panel">
          <h3 style={{ marginTop:0 }}>Recent Activity</h3>
          <RecentAutoPilotPostsWrapper platform={platform} />
        </div>
      )}

      {/* Smart Queue Drawer */}
      {drawerOpen && (
        <div className="drawer">
          <div className="drawer-open">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <h3 style={{ margin:0 }}>Smart Autopilot Queue</h3>
              <button onClick={()=>setDrawerOpen(false)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, padding:'6px 10px' }}>×</button>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <button onClick={() => handlePostNow('all', true)} style={{ padding:'8px 12px', borderRadius:8, background:'rgba(34,197,94,0.2)', border:'1px solid rgba(255,255,255,0.1)' }}>🚀 Post Now</button>
            </div>
            {!queue?.length ? (
              <div style={{ opacity:0.65 }}>No queued items</div>
            ) : (
              <div style={{ display:'grid', gap:10 }}>
                {queue.map((q,i)=>(
                  <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:12 }}>
                    <div style={{ fontWeight:600 }}>{q.title || q.caption || q.source || 'Item'}</div>
                    <div style={{ fontSize:12, opacity:0.7 }}>{q.platform || platform} — {q.scheduledAt ? new Date(q.scheduledAt).toLocaleString() : 'unscheduled'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ title, value, sub, pill }: { title:string; value:React.ReactNode; sub?:string; pill?:string }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ opacity:0.85, fontWeight:600 }}>{title}</div>
        {pill && <span style={{ border:'1px solid rgba(255,255,255,0.2)', padding:'4px 8px', borderRadius:999, fontSize:12 }}>{pill}</span>}
      </div>
      <div style={{ fontSize:24, fontWeight:700 }}>{value ?? ''}</div>
      {sub && <div style={{ fontSize:12, opacity:0.7, marginTop:6 }}>{sub}</div>}
    </div>
  );
}

