"use client";

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';

export default function AutopilotPage() {
  const [active, setActive] = useState(false);
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
            <button className="btn" onClick={async()=>{ await fetch(API_ENDPOINTS.autopilotRun(), { method:'POST' }); }}>🕷️ Scrape</button>
            <button className="btn" onClick={async()=>{ await fetch(API_ENDPOINTS.autopilotRefill(), { method:'POST' }); }}>♻️ Refill</button>
            <button className="btn btn-primary" onClick={async()=>{ await fetch(API_ENDPOINTS.postNow(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform:'instagram', scope:'all' }) }); }}>🚀 Post Now</button>
            <button className="btn" onClick={async()=>{ await fetch(API_ENDPOINTS.autopilotManualPost(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform:'instagram' }) }); }}>✋ Manual Post</button>
            <button className="btn" onClick={async()=>{ await fetch(API_ENDPOINTS.schedulerAutofill(), { method:'POST' }); }}>📅 Autofill</button>
            <a className="btn" href="/dashboard">← Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
