'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/utils/api';
import { toast } from '@/components/NotificationSystem';

type Platform = 'instagram' | 'youtube';

type QueueItem = {
  id?: string;
  platform?: Platform;
  title?: string;
  caption?: string;
  source?: string;
  scheduledAt?: string | null;
  score?: number;
  likes?: number;
  durationSec?: number;
};

export default function AutopilotDashboard() {
  const [platform, setPlatform] = useState<Platform>('instagram');

  // server state
  type Limits = { hourlyLimit?: number; dailyLimit?: number };
  type LockInfo = { held?: boolean; holder?: string };
  type Status = { running?: boolean; limits?: Limits; lock?: LockInfo };
  type Settings = {
    timeZone?: string;
    recentPostsToCheck?: number;
    visualSimilarityRecentPosts?: number;
    minimumIGLikesToRepost?: number;
    minViews?: number;
  };

  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);

  // burst mode state
  const [burst, setBurst] = useState<Record<string, unknown> | null>(null);
  const [burstEnabled, setBurstEnabled] = useState<boolean>(false);
  const [burstCfg, setBurstCfg] = useState({
    startTime: '18:00',
    endTime: '19:00',
    postsPerHour: 60,
    maxTotal: 60,
    preloadMinutes: 20,
    platforms: ['instagram', 'youtube'] as Platform[],
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async (p: Platform = platform) => {
    setLoading(true);
    try {
      const [s, st, q, b, r] = await Promise.all([
        fetch(API_ENDPOINTS.settings(), { cache: 'no-store' }).then(r => r.json()),
        fetch(API_ENDPOINTS.autopilotStatus(), { cache: 'no-store' }).then(r => r.json()),
        fetch(API_ENDPOINTS.autopilotQueue(p, 100), { cache: 'no-store' }).then(r => r.json()),
        fetch(API_ENDPOINTS.burstGet(), { cache: 'no-store' }).then(r => r.json()),
        fetch(API_ENDPOINTS.diagReport(), { cache: 'no-store' }).then(r => r.json()),
      ]);

      setSettings((s || {}) as Settings);
      setStatus((st || {}) as Status);
      setQueue((q?.items || q?.queue || []) as QueueItem[]);

      const enabled = !!(b?.burstModeEnabled ?? b?.enabled);
      setBurst((b || {}) as Record<string, unknown>);
      setBurstEnabled(enabled);

      const cfg = b?.burstModeConfig || b?.config;
      if (cfg) {
        setBurstCfg({
          startTime: cfg.startTime || '18:00',
          endTime: cfg.endTime || '19:00',
          postsPerHour: Number(cfg.postsPerHour ?? 60),
          maxTotal: Number(cfg.maxTotal ?? 60),
          preloadMinutes: Number(cfg.preloadMinutes ?? 20),
          platforms: (cfg.platforms ?? ['instagram', 'youtube']) as Platform[],
        });
      }

      setReport((r || {}) as Record<string, unknown>);
    } catch (e) {
      console.error('reload error', e);
      toast.show('Failed to load autopilot data');
    } finally {
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => { reload(platform); }, [platform, reload]);

  // actions
  const runScrape = async () => {
    setBusy(true);
    try {
      const res = await fetch(API_ENDPOINTS.autopilotRun(), { method: 'POST' });
      const json = await res.json();
      toast.show(json?.message || 'Autopilot scraping started');
      reload();
    } catch {
      toast.show('Failed to start scrape');
    } finally { setBusy(false); }
  };

  const refillQueue = async () => {
    setBusy(true);
    try {
      const res = await fetch(API_ENDPOINTS.autopilotRefill(), { method: 'POST' });
      const json = await res.json();
      toast.show(json?.message || `Refill: +${json?.added ?? 0}`);
      reload();
    } catch {
      toast.show('Failed to refill');
    } finally { setBusy(false); }
  };

  const manualPost = async () => {
    setBusy(true);
    try {
      const res = await fetch(API_ENDPOINTS.autopilotManualPost(), {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ platform }),
      });
      const json = await res.json();
      toast.show(json?.message || 'Manual post triggered');
      reload();
    } catch {
      toast.show('Manual post failed');
    } finally { setBusy(false); }
  };

  const postNowAll = async () => {
    setBusy(true);
    try {
      const res = await fetch(API_ENDPOINTS.postNow(), {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ platform, scope: 'all' })
      });
      const json = await res.json();
      toast.show(json?.message || 'Batch post triggered');
      reload();
    } catch {
      toast.show('Post now failed');
    } finally { setBusy(false); }
  };

  const saveBurstEnabled = async (enabled: boolean) => {
    setBusy(true);
    try {
      const res = await fetch(API_ENDPOINTS.burstPost(), {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ burstModeEnabled: enabled })
      });
      const json = await res.json();
      toast.show(json?.message || (enabled ? 'Burst enabled' : 'Burst disabled'));
      setBurstEnabled(enabled);
      reload();
    } catch {
      toast.show('Failed to toggle burst');
    } finally { setBusy(false); }
  };

  const saveBurstConfig = async () => {
    setBusy(true);
    try {
      const res = await fetch(API_ENDPOINTS.burstConfig(), {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ burstModeConfig: burstCfg })
      });
      const json = await res.json();
      toast.show(json?.message || 'Burst config saved');
      reload();
    } catch {
      toast.show('Failed to save burst config');
    } finally { setBusy(false); }
  };

  const schedulerAutofill = async () => {
    setBusy(true);
    try {
      const res = await fetch(API_ENDPOINTS.schedulerAutofill(), { method: 'POST' });
      const json = await res.json();
      toast.show(json?.message || 'Scheduler autofill done');
      reload();
    } catch {
      toast.show('Autofill failed');
    } finally { setBusy(false); }
  };

  const limits = status?.limits || {};
  const running = !!status?.running;
  const recentN = settings?.recentPostsToCheck ?? settings?.visualSimilarityRecentPosts ?? 30;
  const minLikes = settings?.minimumIGLikesToRepost ?? settings?.minViews ?? 0;

  return (
    <div style={{ padding: 24 }}>
      {/* header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 18 }}>
        <div style={{ display:'flex', gap: 8 }}>
          <Link href="/dashboard" style={{ padding:'8px 12px', border:'1px solid rgba(255,255,255,.15)', borderRadius:8 }}>← Back to Dashboard</Link>
          <button onClick={() => setPlatform('instagram')}
            style={btnTab(platform==='instagram')}>Instagram</button>
          <button onClick={() => setPlatform('youtube')}
            style={btnTab(platform==='youtube')}>YouTube</button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={runScrape} disabled={busy} style={btn()}>
            🕷️ Scrape New
          </button>
          <button onClick={refillQueue} disabled={busy} style={btn()}>
            ♻️ Refill Queue
          </button>
          <button onClick={manualPost} disabled={busy} style={btnAccent()}>
            ✋ Manual Post
          </button>
          <button onClick={postNowAll} disabled={busy} style={btnAccent()}>
            🚀 Post Now (All)
          </button>
        </div>
      </div>

      {/* quick status */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:16 }}>
        <Tile title="Autopilot" value={running ? 'Active' : 'Inactive'} sub={`${limits?.hourlyLimit ?? '--'}/hr • ${limits?.dailyLimit ?? '--'}/day`} pill={running ? 'Running' : 'Stopped'} />
        <Tile title="Repost Protection" value={`Last ${recentN}`} sub="Visual hash + caption + duration" />
        <Tile title={platform==='instagram' ? 'Min IG Likes' : 'Min YT Views'} value={minLikes} sub="Filter threshold" />
        <Tile title="Queue Size" value={queue?.length ?? 0} sub="Ready to schedule" />
      </div>

      {/* burst mode block */}
      <Section title="Burst Mode">
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
          <label style={{ opacity:.9 }}>Enabled</label>
          <div onClick={() => saveBurstEnabled(!burstEnabled)}
               style={{ cursor:'pointer', padding:'6px 10px', border:'1px solid rgba(255,255,255,.2)', borderRadius:999, background: burstEnabled ? 'rgba(34,197,94,.2)' : 'transparent' }}>
            {burstEnabled ? 'ON' : 'OFF'}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10, marginBottom:10 }}>
          <Input label="Start (CT)"  value={burstCfg.startTime}  onChange={v => setBurstCfg(x => ({ ...x, startTime: v }))} type="time" />
          <Input label="End (CT)"    value={burstCfg.endTime}    onChange={v => setBurstCfg(x => ({ ...x, endTime: v }))} type="time" />
          <Input label="Posts/hr"    value={String(burstCfg.postsPerHour)} onChange={v => setBurstCfg(x => ({ ...x, postsPerHour: Number(v||0) }))} />
          <Input label="Max total"   value={String(burstCfg.maxTotal)}     onChange={v => setBurstCfg(x => ({ ...x, maxTotal: Number(v||0) }))} />
          <Input label="Preload (m)" value={String(burstCfg.preloadMinutes)} onChange={v => setBurstCfg(x => ({ ...x, preloadMinutes: Number(v||0) }))} />
        </div>

        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
          <label style={{ opacity:.9 }}>Platforms</label>
          {(['instagram','youtube'] as Platform[]).map(p => {
            const checked = burstCfg.platforms.includes(p);
            return (
              <div key={p} onClick={()=>{
                setBurstCfg(cfg=>{
                  const set = new Set(cfg.platforms);
                  checked ? set.delete(p) : set.add(p);
                  return { ...cfg, platforms: Array.from(set) as Platform[] };
                });
              }} style={{ padding:'6px 10px', border:'1px solid rgba(255,255,255,.2)', borderRadius:999, background:checked?'rgba(0,200,255,.15)':'transparent', cursor:'pointer' }}>
                {p}
              </div>
            );
          })}
        </div>

        <button onClick={saveBurstConfig} disabled={busy} style={btn()}>
          💾 Save Burst Config
        </button>
      </Section>

      {/* queue */}
      <Section title={`Smart Queue (${platform})`}>
        {!queue?.length ? (
          <div style={{ opacity:.65 }}>Queue is empty</div>
        ) : (
          <div style={{ display:'grid', gap:10 }}>
            {queue.map((q, i) => (
              <div key={q.id || i} style={{
                background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:12
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, marginBottom:4 }}>{q.title || q.caption || q.source || 'Item'}</div>
                    <div style={{ fontSize:12, opacity:.75 }}>
                      {q.platform || platform} • {q.scheduledAt ? new Date(q.scheduledAt).toLocaleString() : 'unscheduled'}
                      {q.likes != null && <> • 👍 {q.likes}</>}
                      {q.durationSec != null && <> • ⏱ {q.durationSec}s</>}
                      {q.score != null && <> • ⭐ {q.score}</>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop:12, display:'flex', gap:8 }}>
          <button onClick={schedulerAutofill} disabled={busy} style={btn()}>📅 Autofill Schedule</button>
          <button onClick={() => reload()} disabled={busy} style={btn()}>🔄 Refresh</button>
        </div>
      </Section>

      {/* diagnostics */}
      <Section title="Diagnostics">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          <Tile title="Time Zone" value={settings?.timeZone || '—'} sub="Scheduler TZ" />
          <Tile title="Hourly / Daily Limit" value={`${limits?.hourlyLimit ?? '—'} / ${limits?.dailyLimit ?? '—'}`} sub="Caps" />
          <Tile title="Lock Status" value={status?.lock?.held ? 'Held' : 'Free'} sub={status?.lock?.holder || ''} />
        </div>

        <div style={{ marginTop:12, fontSize:12, opacity:.8, whiteSpace:'pre-wrap' }}>
          {JSON.stringify(report, null, 2)}
        </div>
      </Section>

      {loading && <div style={{ position:'fixed', bottom:20, right:20, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', padding:'8px 10px', borderRadius:8 }}>Loading…</div>}
    </div>
  );
}

// UI bits
function Section({ title, children }: { title:string; children: React.ReactNode }) {
  return (
    <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:16, marginTop:16 }}>
      <h3 style={{ marginTop:0 }}>{title}</h3>
      {children}
    </div>
  );
}
function Tile({ title, value, sub, pill }: { title:string; value:React.ReactNode; sub?:string; pill?:string }) {
  return (
    <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ opacity:.85, fontWeight:600 }}>{title}</div>
        {pill && <span style={{ border:'1px solid rgba(255,255,255,.2)', padding:'4px 8px', borderRadius:999, fontSize:12 }}>{pill}</span>}
      </div>
      <div style={{ fontSize:24, fontWeight:700 }}>{value ?? ''}</div>
      {sub && <div style={{ fontSize:12, opacity:.7, marginTop:6 }}>{sub}</div>}
    </div>
  );
}
function Input({ label, value, onChange, type='text' }:{ label:string; value:string; onChange:(v:string)=>void; type?:string }) {
  return (
    <label style={{ display:'grid', gap:6, fontSize:12 }}>
      <span style={{ opacity:.9 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e=>onChange(e.target.value)}
        style={{ padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,.15)', background:'transparent', color:'#fff' }}
      />
    </label>
  );
}
function btn() {
  return { padding:'10px 12px', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, background:'transparent', color:'#fff', cursor:'pointer' } as React.CSSProperties;
}
function btnAccent() {
  return { ...btn(), background:'rgba(34,197,94,.2)' } as React.CSSProperties;
}
function btnTab(active:boolean) {
  return { ...btn(), background: active ? 'rgba(0,200,255,.15)' : 'transparent' } as React.CSSProperties;
}

