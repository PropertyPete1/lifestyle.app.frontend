'use client';

import React from 'react';
import ChartWave from '@/components/ChartWave';
import ChartLines from '@/components/ChartLines';
import ActivityHeatmap from '@/components/ActivityHeatmap';

export default function DashboardPage() {
  const togglePlatform = (platform: 'instagram' | 'youtube') => {
    const btn = document.getElementById(platform + 'Toggle');
    if (!btn) return;
    btn.classList.toggle('active');
    btn.innerHTML = btn.classList.contains('active')
      ? (platform === 'instagram' ? '📷 Instagram ✓' : '📺 YouTube ✓')
      : (platform === 'instagram' ? '📷 Instagram' : '📺 YouTube');
  };
  const toggleRecent = () => {
    const btn = document.getElementById('recentToggle');
    if (!btn) return;
    btn.innerHTML = btn.innerHTML.includes('Hide') ? '👁️ Show Recent' : '👁️ Hide Recent';
  };
  const demo = [12, 40, 22, 55, 31, 70, 18, 33, 64, 28, 49, 61];
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
            <button className="btn btn-toggle" id="instagramToggle" onClick={() => togglePlatform('instagram')}>📷 Instagram</button>
            <button className="btn btn-toggle" id="youtubeToggle" onClick={() => togglePlatform('youtube')}>📺 YouTube</button>
          </div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">📈 Wave & Lines</h3>
          <ChartWave />
          <ChartLines points={demo} />
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🔥 Activity Heatmap</h3>
          <ActivityHeatmap />
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🎛️ Navigation</h3>
          <div className="btn-grid">
            <a className="btn" href="/autopilot">🤖 AutoPilot Dashboard</a>
            <a className="btn" href="/settings">⚙️ Settings</a>
            <a className="btn" href="/analytics">📊 Analytics</a>
          </div>
        </div>
      </div>
    </div>
  );
}
