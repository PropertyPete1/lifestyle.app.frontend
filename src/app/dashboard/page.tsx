'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import ChartWave from '@/components/ChartWave';
import ChartLines from '@/components/ChartLines';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { API_ENDPOINTS } from '@/utils/api';
import dynamic from 'next/dynamic';
const AutopilotSwitch = dynamic(() => import('@/components/AutopilotSwitch'), { ssr: false });
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
try { dayjs.extend(utc); } catch {}
try { dayjs.extend(tz); } catch {}
const CT = 'America/Chicago';
const prettyCT = (iso?: string) => (iso ? dayjs.utc(iso).tz(CT).format('MMM D, h:mm A z') : '');

type Platform = 'instagram' | 'youtube';

export default function DashboardPage() {
  const router = useRouter();
  const { show } = useToast();
  const [platform, setPlatform] = useState<Platform>('instagram');
  type Analytics = { instagram?: { followers?: number|string; engagement?: string|null; reach?: number|null }; youtube?: { subscribers?: number|string; watchTime?: string|null; views?: number|null } };
  type Status = { running?: boolean; limits?: { hourlyLimit?: number; dailyLimit?: number } };
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [status, setStatus] = useState<Status>({});
  const [igChart, setIgChart] = useState<number[]>([]);
  const [ytChart, setYtChart] = useState<number[]>([]);
  const [seriesDates, setSeriesDates] = useState<string[]>([]);
  const [showIG, setShowIG] = useState(true);
  const [showYT, setShowYT] = useState(true);
  const [smooth, setSmooth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [burst, setBurst] = useState<{ enabled?: boolean } | null>(null);
  const [recentPosts, setRecentPosts] = useState<{ platform?: string; title?: string; ts?: number }[]>([]);
  type ScheduledItem = { _id?: string; id?: string; platform?: string; title?: string; scheduledAt?: string; status?: string };
  const [scheduledNext, setScheduledNext] = useState<ScheduledItem[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const noCache: RequestInit = { cache: 'no-store', headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } } as any;
      const [a, s, igSeries, ytSeries, b, rp, sched] = await Promise.all([
        fetch(API_ENDPOINTS.analytics(), noCache).then(r => r.json()),
        fetch(API_ENDPOINTS.autopilotStatus(), noCache).then(r => r.json()),
        fetch(API_ENDPOINTS.analyticsSeries('instagram', 30), noCache).then(r => r.json()),
        fetch(API_ENDPOINTS.analyticsSeries('youtube', 30), noCache).then(r => r.json()),
        fetch(API_ENDPOINTS.burstGet(), noCache).then(r => r.json()).catch(()=>({})),
        fetch(API_ENDPOINTS.activityRecentPosts(undefined, 5), noCache).then(r => r.json()).catch(()=>({ items: [] })),
        fetch(API_ENDPOINTS.autopilotQueue(undefined, 10, 1, undefined, undefined, 'true'), noCache).then(r => r.json()).catch(()=>({ items: [] }))
      ]);
      setAnalytics(a || {});
      setStatus(s || {});
      setIgChart((igSeries?.postCounts || []) as number[]);
      setYtChart((ytSeries?.postCounts || []) as number[]);
      setSeriesDates((igSeries?.dates || ytSeries?.dates || []) as string[]);
      setBurst(b || {});
      setRecentPosts((rp?.items || []).slice(0,5));
      const allowed: Array<string> = ['queued', 'scheduled', 'publishing', 'posting'];
      const schedItems: ScheduledItem[] = (sched?.items || [])
        .filter((x: any) => allowed.includes(String((x as any)?.status || '').toLowerCase()))
        .filter((x: ScheduledItem)=> x?.scheduledAt)
        .sort((a: ScheduledItem,b: ScheduledItem)=> new Date(a.scheduledAt || '').getTime() - new Date(b.scheduledAt || '').getTime())
        .slice(0,5);
      setScheduledNext(schedItems);
    } catch {
      setAnalytics({}); setStatus({}); setIgChart([]); setYtChart([]); setBurst(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [platform, loadDashboardData]);

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
        {burst?.enabled && (
          <div className="btn" style={{ display:'inline-block', marginTop:8 }}>🌩️ Burst ON</div>
        )}
        <p className="page-subtitle">Command center for your social media empire</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🎯 Social Platforms</h3>
          <div className="btn-grid">
            <button className={`btn btn-toggle ${platform==='instagram'?'active':''}`} onClick={() => setPlatform('instagram')}>📷 Instagram</button>
            <button className={`btn btn-toggle ${platform==='youtube'?'active':''}`} onClick={() => setPlatform('youtube')}>📺 YouTube</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <AutopilotSwitch />
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📈 Activity Lines (IG & YT)</h3>
          <ChartWave />
          <ChartLines
            igSeries={igChart}
            ytSeries={ytChart}
            dates={seriesDates}
            smoothing={smooth}
            showIG={showIG}
            showYT={showYT}
            normalize
            speedFactor={Math.max(0.5, Math.min(3, ((igChart.reduce((a,b)=>a+b,0)/(igChart.length||1)) + (ytChart.reduce((a,b)=>a+b,0)/(ytChart.length||1)))/2))}
            onToggleIG={(v)=> setShowIG(v)}
            onToggleYT={(v)=> setShowYT(v)}
            onToggleSmoothing={(v)=> setSmooth(v)}
            onClickDate={(date)=>{
              const params = new URLSearchParams();
              if (date) params.set('date', date);
              params.set('platform', platform);
              router.push(`/autopilot?${params.toString()}`);
            }}
          />
          <div className="btn-grid" style={{ marginTop: 8 }}>
            <button className="btn" onClick={()=>{ setShowIG(true); setShowYT(true); setSmooth(true); }}>Reset</button>
            <div className="btn">IG: {showIG ? 'On' : 'Off'}</div>
            <div className="btn">YT: {showYT ? 'On' : 'Off'}</div>
            <div className="btn">Smooth: {smooth ? 'On' : 'Off'}</div>
          </div>
          <div className="btn-grid" style={{ marginTop: 8 }}>
            <button className="btn" onClick={(e)=>{
              e.preventDefault();
              const el = document.getElementById('day-click-help');
              if (el) { el.style.opacity = '1'; setTimeout(()=>{ if (el) el.style.opacity = '0.6'; }, 1600); }
            }}>ℹ️ Click a day to open queue</button>
            <div id="day-click-help" style={{ opacity: 0.6 }}>Use Analytics to drill down by date</div>
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📅 Upcoming Scheduled</h3>
          <div style={{ maxHeight: 200, overflowY:'auto', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'0.5rem' }}>
            {scheduledNext.map((p, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', alignItems:'center', gap:8, padding:'0.4rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{opacity:0.9}}>{p.title || 'Queued Item'}</div>
                <div className="btn" style={{padding:'4px 8px'}}>{(p.platform||'').toUpperCase()}</div>
                <div style={{opacity:0.7}}>{p.scheduledAt ? prettyCT(p.scheduledAt) : ''}</div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn" onClick={async()=>{
                    const itemId = p._id || p.id;
                    const pl = (p.platform || '').toLowerCase();
                    if (!itemId || (pl !== 'instagram' && pl !== 'youtube')) return;
                    const r = await fetch(API_ENDPOINTS.postNow(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: pl, scope:'single', itemId }) });
                    show(r.ok? 'Post Now triggered' : 'Post Now failed', r.ok?'success':'error');
                    if (r.ok) await loadDashboardData();
                  }}>🚀</button>
                  <button className="btn" onClick={async()=>{
                    const itemId = p._id || p.id;
                    if (!itemId) return;
                    const r = await fetch(API_ENDPOINTS.autopilotQueueRemove(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ itemId, platform: p.platform }) });
                    show(r.ok? 'Removed' : 'Remove failed', r.ok?'success':'error');
                    if (r.ok) setScheduledNext(prev => prev.filter(x => (x._id||x.id) !== itemId));
                  }}>🗑</button>
                </div>
              </div>
            ))}
            {scheduledNext.length === 0 && <div style={{opacity:0.7}}>No upcoming scheduled items</div>}
          </div>
          <div className="btn-grid" style={{ marginTop: 8 }}>
            <a className="btn" href="/autopilot">Open Smart Queue →</a>
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📰 Recently Posted</h3>
          <div style={{ maxHeight: 200, overflowY:'auto', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'0.5rem' }}>
            {recentPosts.map((p, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{opacity:0.9}}>{p.title || 'Post'}</div>
                <div style={{opacity:0.7}}>{p.platform?.toUpperCase()}</div>
                <div style={{opacity:0.6}}>{p.ts ? prettyCT(new Date(p.ts).toISOString()) : ''}</div>
              </div>
            ))}
            {recentPosts.length === 0 && <div style={{opacity:0.7}}>No recent posts</div>}
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🔥 Activity Heatmap</h3>
          <ActivityHeatmap platform={platform} />
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">⚡ Quick Actions</h3>
          <div className="btn-grid">
            <button className="btn btn-primary" disabled={posting} onClick={async ()=>{
              try {
                setPosting(true);
                await Promise.all([
                  fetch(API_ENDPOINTS.postNow(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform:'instagram', scope:'next' }) }),
                  fetch(API_ENDPOINTS.postNow(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform:'youtube', scope:'next' }) })
                ]);
                await loadDashboardData();
              } finally {
                setPosting(false);
              }
            }}>🚀 Post Now (All)</button>
            <a className="btn" href="/autopilot">Open AutoPilot</a>
            <div className="btn">Burst: {burst?.enabled ? 'Active' : 'Inactive'}</div>
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
