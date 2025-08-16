"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';
import { useToast } from '@/components/Toast';

type Platform = 'instagram' | 'youtube';
type QueueItemSummary = {
  title?: string;
  caption?: string;
  videoId?: string;
  _id?: string;
  id?: string;
  platform?: Platform | string;
};

export default function AutopilotPage() {
  const { show } = useToast();
  const [active, setActive] = useState(false);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [burstLoading, setBurstLoading] = useState(false);
  const [burstStatus, setBurstStatus] = useState<{ enabled?: boolean; windowMinutes?: number; maxPerWindow?: number } | null>(null);
  const [cfgWindowMinutes, setCfgWindowMinutes] = useState<number>(60);
  const [cfgMaxPerWindow, setCfgMaxPerWindow] = useState<number>(6);
  const [savingConfig, setSavingConfig] = useState(false);
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagSummary, setDiagSummary] = useState<string>('');
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItemSummary[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('platform');
    if (saved === 'instagram' || saved === 'youtube') setPlatform(saved);
  }, []);

  const setPlatformPersist = (p: Platform) => {
    setPlatform(p);
    if (typeof window !== 'undefined') localStorage.setItem('platform', p);
  };

  const loadBurstStatus = async () => {
    try {
      setBurstLoading(true);
      const res = await fetch(API_ENDPOINTS.burstGet(), { cache: 'no-store' });
      const json = await res.json();
      setBurstStatus(json || {});
      if (typeof json?.windowMinutes === 'number') setCfgWindowMinutes(json.windowMinutes);
      if (typeof json?.maxPerWindow === 'number') setCfgMaxPerWindow(json.maxPerWindow);
    } catch {
      setBurstStatus(null);
    } finally {
      setBurstLoading(false);
    }
  };

  const setBurst = async (enabled: boolean) => {
    try {
      setBurstLoading(true);
      await fetch(API_ENDPOINTS.burstPost(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, platform }),
      });
      await loadBurstStatus();
    } finally { setBurstLoading(false); }
  };

  const saveBurstConfig = async () => {
    try {
      setSavingConfig(true);
      await fetch(API_ENDPOINTS.burstConfig(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowMinutes: cfgWindowMinutes, maxPerWindow: cfgMaxPerWindow, platform }),
      });
      await loadBurstStatus();
    } finally { setSavingConfig(false); }
  };

  const runDiagnostics = async () => {
    try {
      setDiagRunning(true);
      const res = await fetch(API_ENDPOINTS.diagReport(), { cache: 'no-store' });
      const json = await res.json();
      setDiagSummary(JSON.stringify(json)?.slice(0, 400));
    } catch { setDiagSummary('Failed to run diagnostics'); }
    finally { setDiagRunning(false); }
  };

  const loadQueue = useCallback(async () => {
    try {
      setQueueLoading(true);
      const res = await fetch(API_ENDPOINTS.autopilotQueue(platform, 50), { cache: 'no-store' });
      const json = await res.json();
      setQueueItems((json?.items as QueueItemSummary[]) || []);
    } catch { setQueueItems([]); }
    finally { setQueueLoading(false); }
  }, [platform]);

  useEffect(() => {
    // Initial loads when page opens or platform changes
    loadBurstStatus();
    loadQueue();
  }, [loadQueue]);
  const toggle = () => {
    const loader = document.getElementById('autopilotLoader');
    const status = document.getElementById('autopilotStatus');
    const button = document.getElementById('autopilotToggle') as HTMLButtonElement | null;
    if (!loader || !status || !button) return;
    loader.style.display = 'inline-block';
    button.disabled = true;
    setTimeout(() => {
      const next = !active; setActive(next);
      if (next) {
        button.innerHTML = '⏹️ Deactivate AutoPilot';
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
        status.className = 'status-indicator status-active';
        status.innerHTML = '<div style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; animation: pulse 1s infinite;"></div> ✅ AutoPilot Active';
      } else {
        button.innerHTML = '🚀 Activate AutoPilot';
        button.classList.remove('btn-danger');
        button.classList.add('btn-primary');
        status.className = 'status-indicator status-inactive';
        status.innerHTML = '⭕ AutoPilot Inactive';
      }
      loader.style.display = 'none';
      button.disabled = false;
    }, 1500);
  };
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title vintage-accent">AutoPilot Dashboard</h1>
        <p className="page-subtitle">Intelligent automation for seamless content management</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🎯 Social Platforms</h3>
          <div className="btn-grid">
            <button className={`btn btn-toggle ${platform==='instagram'?'active':''}`} onClick={() => setPlatformPersist('instagram')}>📷 Instagram</button>
            <button className={`btn btn-toggle ${platform==='youtube'?'active':''}`} onClick={() => setPlatformPersist('youtube')}>📺 YouTube</button>
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🚀 AutoPilot Control</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="status-indicator status-inactive" id="autopilotStatus">
              <div className="loading" style={{ display: 'none' }} id="autopilotLoader"></div>
              ⭕ AutoPilot Inactive
            </div>
          </div>
          <div className="btn-grid">
            <button className="btn btn-primary" id="autopilotToggle" onClick={toggle}>🚀 Activate AutoPilot</button>
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">⚡ Quick Actions</h3>
          <div className="btn-grid">
            <button className="btn" onClick={async()=>{ const r= await fetch(API_ENDPOINTS.autopilotRun(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform }) }); show(r.ok? 'Scrape started' : 'Scrape failed', r.ok?'success':'error'); }}>🕷️ Scrape</button>
            <button className="btn" onClick={async()=>{ const r= await fetch(API_ENDPOINTS.autopilotRefill(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform }) }); show(r.ok? 'Refill queued' : 'Refill failed', r.ok?'success':'error'); }}>♻️ Refill</button>
            <button className="btn btn-primary" onClick={async()=>{ const r= await fetch(API_ENDPOINTS.postNow(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform, scope:'all' }) }); show(r.ok? 'Post Now triggered' : 'Post Now failed', r.ok?'success':'error'); }}>🚀 Post Now ({platform})</button>
            <button className="btn" onClick={async()=>{ const r= await fetch(API_ENDPOINTS.autopilotManualPost(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform }) }); show(r.ok? 'Manual post queued' : 'Manual post failed', r.ok?'success':'error'); }}>✋ Manual Post</button>
            <button className="btn" onClick={async()=>{ const r= await fetch(API_ENDPOINTS.schedulerAutofill(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform }) }); show(r.ok? 'Autofill scheduled' : 'Autofill failed', r.ok?'success':'error'); }}>📅 Autofill</button>
            <a className="btn" href="/dashboard">← Back to Dashboard</a>
          </div>
        </div>

        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🌩️ Burst Controls</h3>
          <div className="btn-grid" style={{ marginBottom: '1rem' }}>
            <div className="btn">Status: {burstLoading ? 'Loading…' : (burstStatus?.enabled ? 'Active' : 'Inactive')}</div>
            <button className="btn" disabled={burstLoading} onClick={()=>setBurst(true)}>Burst ON</button>
            <button className="btn" disabled={burstLoading} onClick={()=>setBurst(false)}>Burst OFF</button>
          </div>
          <div className="btn-grid">
            <label className="btn">
              Window (min)
              <input style={{ marginLeft: '0.5rem', width: '6rem' }} type="number" value={cfgWindowMinutes} onChange={(e)=>setCfgWindowMinutes(parseInt(e.target.value||'0',10))} />
            </label>
            <label className="btn">
              Max / Window
              <input style={{ marginLeft: '0.5rem', width: '6rem' }} type="number" value={cfgMaxPerWindow} onChange={(e)=>setCfgMaxPerWindow(parseInt(e.target.value||'0',10))} />
            </label>
            <button className="btn btn-primary" disabled={savingConfig} onClick={saveBurstConfig}>💾 Save Config</button>
          </div>
        </div>

        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🧪 Diagnostics</h3>
          <div className="btn-grid">
            <button className="btn" disabled={diagRunning} onClick={runDiagnostics}>{diagRunning ? 'Running…' : 'Run Diagnostics'}</button>
            <div className="btn" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Last: {diagSummary || '—'}</div>
          </div>
        </div>

        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📋 Smart Queue</h3>
          <div className="btn-grid" style={{ marginBottom: '1rem' }}>
            <button className="btn" disabled={queueLoading} onClick={loadQueue}>{queueLoading ? 'Refreshing…' : 'Refresh Queue'}</button>
            <div className="btn">Items: {queueItems.length}</div>
          </div>
          <div style={{ maxHeight: '260px', overflowY: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', padding: '0.5rem' }}>
            {queueItems.slice(0, 12).map((it, idx) => {
              const title = it?.title || it?.caption || it?.videoId || it?._id || it?.id || `Item ${idx+1}`;
              return (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ opacity: 0.9 }}>{idx+1}. {String(title)}</div>
                  <div style={{ fontSize:'0.8rem', opacity:0.6 }}>{it?.platform || platform}</div>
                </div>
              );
            })}
            {queueItems.length === 0 && !queueLoading && <div style={{opacity:0.7}}>No items</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
