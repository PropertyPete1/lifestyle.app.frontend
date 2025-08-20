"use client";

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/utils/api';
import { displayIso, formatLocal, type QueueItem } from '@/lib/time';
import { useToast } from '@/components/Toast';
import { autopilotQueueRemoveEndpoint } from '@/utils/api';

type Platform = 'instagram' | 'youtube';
type QueueItemSummary = {
  title?: string;
  caption?: string;
  videoId?: string;
  _id?: string;
  id?: string;
  platform?: Platform | string;
};

function AutopilotPageInner() {
  const { show } = useToast();
  const search = useSearchParams();
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
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QueueItemSummary | null>(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [scheduledFilter, setScheduledFilter] = useState<''|'true'|'false'>('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('platform');
    if (saved === 'instagram' || saved === 'youtube') setPlatform(saved);
  }, []);

  // Read deep-link params
  useEffect(() => {
    const p = search?.get('platform');
    const d = search?.get('date');
    if (p === 'instagram' || p === 'youtube') setPlatform(p);
    if (d) setDateFilter(d);
    if (d) setQueueModalOpen(true);
  }, [search]);

  const setPlatformPersist = (p: Platform) => {
    setPlatform(p);
    if (typeof window !== 'undefined') localStorage.setItem('platform', p);
  };

  const loadBurstStatus = async () => {
    // Deprecated endpoint removed; leave status unknown (null)
    setBurstLoading(true);
    try {
      setBurstStatus(null);
    } finally {
      setBurstLoading(false);
    }
  };

  const setBurst = async (enabled: boolean) => {
    // No live endpoint for burst toggle; noop but keep UI responsive
    try {
      setBurstLoading(true);
      await loadBurstStatus();
    } finally { setBurstLoading(false); }
  };

  const saveBurstConfig = async () => {
    // No live endpoint for burst config; noop and return
    setSavingConfig(true);
    try { await loadBurstStatus(); } finally { setSavingConfig(false); }
  };

  const runDiagnostics = async () => {
    try {
      setDiagRunning(true);
      const base = (typeof window !== 'undefined' && (window as unknown as { __API_BASE__?: string }).__API_BASE__) || process.env.NEXT_PUBLIC_API_URL || '';
      const url = base ? `${base}/api/diag/autopilot-report` : '/api/diag/autopilot-report';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      setDiagSummary(JSON.stringify(json)?.slice(0, 400));
    } catch {
      setDiagSummary('Failed to load diagnostics');
    } finally {
      setDiagRunning(false);
    }
  };

  const loadQueue = useCallback(async () => {
    try {
      setQueueLoading(true);
      const statusParam = statusFilter || undefined;
      const scheduledParam = scheduledFilter === '' ? undefined : scheduledFilter;
      const res = await fetch(API_ENDPOINTS.autopilotQueue(platform, 50, page, q, statusParam, scheduledParam, dateFilter || undefined), { cache: 'no-store' });
      const json = await res.json();
      setQueueItems((json?.items as QueueItemSummary[]) || []);
      setPages(json?.pages || 1);
      setTotal(json?.total || 0);
    } catch { setQueueItems([]); setPages(1); setTotal(0); }
    finally { setQueueLoading(false); }
  }, [platform, page, q, statusFilter, scheduledFilter, dateFilter]);

  useEffect(() => {
    // Initial loads when page opens or platform changes
    loadBurstStatus();
    loadQueue();
  }, [loadQueue]);

  // Auto-refresh queue when filters change
  useEffect(() => {
    loadQueue();
  }, [platform, dateFilter, statusFilter, scheduledFilter, q, page]);
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
    <Suspense fallback={<div style={{opacity:.7}}>Loading…</div>}>
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
            <button className="btn" onClick={async()=>{
              const base = (typeof window !== 'undefined' && (window as unknown as { __API_BASE__?: string }).__API_BASE__) || process.env.NEXT_PUBLIC_API_URL || '';
              const url = base ? `${base}/api/autopilot/prime-fixed` : '/api/autopilot/prime-fixed';
              const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, cache:'no-store', body: JSON.stringify({ platform }) });
              show(r.ok? 'Prime started' : 'Prime failed', r.ok?'success':'error');
            }}>🕷️ Scrape</button>
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
            <button className="btn" disabled={queueLoading} onClick={()=>{ setScheduledFilter('true'); setPage(1); loadQueue(); }}>{queueLoading ? 'Refreshing…' : 'Refresh Queue'}</button>
            <div className="btn">Items: {total}</div>
            <button className="btn btn-primary" onClick={()=>{ setQueueModalOpen(true); setSelectedItem(null); }}>Open Queue</button>
          </div>
          <div style={{ maxHeight: '260px', overflowY: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', padding: '0.5rem' }}>
            {queueItems.slice(0, 12).map((it, idx) => {
              const title = it?.title || it?.caption || it?.videoId || it?._id || it?.id || `Item ${idx+1}`;
              return (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ opacity: 0.9 }}>{idx+1}. {String(title)}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <div style={{ fontSize:'0.8rem', opacity:0.6 }}>{it?.platform || platform}</div>
                    <button className="btn" onClick={()=>{ setSelectedItem(it); setQueueModalOpen(true); }}>Details</button>
                  </div>
                </div>
              );
            })}
            {queueItems.length === 0 && !queueLoading && <div style={{opacity:0.7}}>No items</div>}
          </div>
        </div>
        {queueModalOpen && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(3px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:'min(1024px, 94vw)', maxHeight:'88vh', overflow:'auto', background:'rgba(20,20,28,0.95)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'1rem 1.25rem', boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                <h3 className="card-title" style={{ margin:0 }}>Smart Queue ({platform})</h3>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }} placeholder="Search…" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', padding:'6px 10px', borderRadius:8 }} />
                  <input type="date" value={dateFilter} onChange={(e)=>{ setPage(1); setDateFilter(e.target.value); }} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', padding:'6px 10px', borderRadius:8 }} />
                  <select value={statusFilter} onChange={(e)=>{ setPage(1); setStatusFilter(e.target.value); }} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', padding:'6px 10px', borderRadius:8 }}>
                    <option value="">All Status</option>
                    <option value="queued">Queued</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="posted">Posted</option>
                    <option value="failed">Failed</option>
                  </select>
                  <select value={scheduledFilter} onChange={(e)=>{ setPage(1); setScheduledFilter(e.target.value as 'true'|'false'|''); }} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', padding:'6px 10px', borderRadius:8 }}>
                    <option value="">All</option>
                    <option value="true">Scheduled</option>
                    <option value="false">Unscheduled</option>
                  </select>
                  <button className="btn" onClick={()=>{ setSelectedItem(null); setQueueModalOpen(false); }}>Close</button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1rem' }}>
                <div style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'0.5rem' }}>
                  {queueItems
                    .sort((a,b)=>{
                      const ai = displayIso((a as unknown as QueueItem));
                      const bi = displayIso((b as unknown as QueueItem));
                      const at = ai ? new Date(ai).getTime() : 0;
                      const bt = bi ? new Date(bi).getTime() : 0;
                      return at - bt;
                    })
                    .map((it, idx) => {
                    const title = it?.title || it?.caption || it?.videoId || it?._id || it?.id || `Item ${idx+1}`;
                    const isSel = (selectedItem && (selectedItem._id||selectedItem.id||selectedItem.videoId)) === (it._id||it.id||it.videoId);
                    return (
                      <div key={idx} onClick={()=>setSelectedItem(it)} style={{ padding:'0.6rem 0.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)', background: isSel? 'rgba(255,255,255,0.06)' : 'transparent', cursor:'pointer', borderRadius:6 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ opacity:0.9 }}>
                            {idx+1 + (page-1)*50}. {String(title)}{' '}
                            {String((it as unknown as { status?: string })?.status||'')==='verifying' && (
                              <span className="ml-2 inline-flex items-center rounded border px-1.5 py-0.5 text-xs opacity-80">Verifying…</span>
                            )}
                          </div>
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <div style={{ fontSize:'0.8rem', opacity:0.6 }}>{it?.platform || platform}</div>
                            <div style={{ fontSize:'0.8rem', opacity:0.6 }}>
                              {(() => { const iso = displayIso((it as unknown as QueueItem)); return iso ? formatLocal(iso) : ''; })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {queueItems.length === 0 && <div style={{opacity:0.7, padding:'0.5rem'}}>No items</div>}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0' }}>
                    <div className="btn">Page {page} / {pages}</div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn" disabled={page<=1} onClick={()=> setPage(p=>Math.max(1, p-1))}>← Prev</button>
                      <button className="btn" disabled={page>=pages} onClick={()=> setPage(p=>Math.min(pages, p+1))}>Next →</button>
                    </div>
                  </div>
                </div>
                <div style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'0.75rem' }}>
                  <h4 style={{ marginTop:0, marginBottom:'0.5rem' }}>Details</h4>
                  {!selectedItem && <div style={{opacity:0.7}}>Select an item to see details</div>}
                  {selectedItem && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <div><b>Title</b>: {selectedItem.title || selectedItem.caption || selectedItem.videoId || selectedItem._id || selectedItem.id}</div>
                      {selectedItem.caption && <div style={{opacity:0.9}}>{selectedItem.caption}</div>}
                      <div style={{opacity:0.7}}>ID: {selectedItem._id || selectedItem.id || selectedItem.videoId}</div>
                      <div className="btn-grid" style={{ marginTop:'0.5rem' }}>
                        <button className="btn btn-primary" onClick={async()=>{
                          const id = selectedItem._id || selectedItem.id || selectedItem.videoId;
                          const r = await fetch(API_ENDPOINTS.autopilotManualPost(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform, itemId:id }) });
                          show(r.ok? 'Manual post queued' : 'Manual post failed', r.ok?'success':'error');
                        }}>✋ Manual Post</button>
                        <button className="btn" onClick={async()=>{
                          const id = selectedItem._id || selectedItem.id || selectedItem.videoId;
                          const r = await fetch(API_ENDPOINTS.postNow(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform, scope:'single', itemId:id }) });
                          show(r.ok? 'Post Now triggered' : 'Post Now failed', r.ok?'success':'error');
                        }}>🚀 Post Now</button>
                        <button className="btn" onClick={async()=>{
                          const id = selectedItem._id || selectedItem.id || selectedItem.videoId;
                          // optimistic: move to top locally
                          setQueueItems(prev => {
                            const idx = prev.findIndex(x => (x._id||x.id||x.videoId) === id);
                            if (idx <= 0) return prev;
                            const copy = [...prev];
                            const [item] = copy.splice(idx,1);
                            copy.unshift(item);
                            return copy;
                          });
                          const r = await fetch(API_ENDPOINTS.autopilotQueuePrioritize(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform, itemId:id }) });
                          show(r.ok? 'Prioritized' : 'Prioritize failed', r.ok?'success':'error');
                        }}>⬆️ Prioritize</button>
                        <button className="btn" onClick={async()=>{
                          const id = selectedItem._id || selectedItem.id || selectedItem.videoId;
                          // optimistic: remove locally
                          setQueueItems(prev => prev.filter(x => (x._id||x.id||x.videoId) !== id));
                          setSelectedItem(null);
                          const r = await fetch(autopilotQueueRemoveEndpoint(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform, itemId:id }) });
                          show(r.ok? 'Removed from queue' : 'Remove failed', r.ok?'success':'error');
                        }}>🗑 Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </Suspense>
  );
}

export default function AutopilotPage() {
  return (
    <Suspense fallback={<div style={{opacity:.7}}>Loading…</div>}>
      <AutopilotPageInner />
    </Suspense>
  );
}
