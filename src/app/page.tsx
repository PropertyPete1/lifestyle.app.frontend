'use client';

import React, { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    // Create floating particles
    const container = document.getElementById('particles');
    if (container) {
      container.innerHTML = '';
      const count = 50;
      for (let i = 0; i < count; i++) {
        const d = document.createElement('div');
        d.className = 'particle';
        d.style.left = Math.random() * 100 + '%';
        d.style.animationDelay = Math.random() * 20 + 's';
        d.style.animationDuration = (Math.random() * 10 + 15) + 's';
        container.appendChild(d);
      }
    }
  }, []);

  const showPage = (pageId: string) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  };

  const navClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    showPage(id);
    (e.currentTarget as HTMLAnchorElement).classList.add('active');
  };

  let instagramActive = false;
  let youtubeActive = false;
  const togglePlatform = (platform: 'instagram' | 'youtube') => {
    const btn = document.getElementById(platform + 'Toggle');
    if (!btn) return;
    if (platform === 'instagram') {
      instagramActive = !instagramActive;
      btn.classList.toggle('active', instagramActive);
      btn.innerHTML = instagramActive ? '📷 Instagram ✓' : '📷 Instagram';
    } else {
      youtubeActive = !youtubeActive;
      btn.classList.toggle('active', youtubeActive);
      btn.innerHTML = youtubeActive ? '📺 YouTube ✓' : '📺 YouTube';
    }
  };

  let recentVisible = false;
  const toggleRecent = () => {
    recentVisible = !recentVisible;
    const btn = document.getElementById('recentToggle');
    if (btn) btn.innerHTML = recentVisible ? '👁️ Hide Recent' : '👁️ Show Recent';
  };

  let autopilotActive = false;
  const toggleAutoPilot = () => {
    const button = document.getElementById('autopilotToggle') as HTMLButtonElement | null;
    const status = document.getElementById('autopilotStatus');
    const loader = document.getElementById('autopilotLoader');
    if (!button || !status || !loader) return;
    loader.setAttribute('style', 'display:inline-block');
    button.disabled = true;
    setTimeout(() => {
      autopilotActive = !autopilotActive;
      if (autopilotActive) {
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
      loader.setAttribute('style', 'display:none');
      button.disabled = false;
    }, 1500);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = '@keyframes pulse { 0%, 100% { opacity:1; transform: scale(1);} 50% { opacity:.5; transform: scale(1.2);} }';
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <div id="particles" className="bg-particles" />
      <nav className="navbar">
        <div className="navbar-left">
          <a href="#" className="nav-link active" onClick={(e)=>navClick(e,'dashboard')}>Dashboard</a>
          <a href="#" className="nav-link" onClick={(e)=>navClick(e,'autopilot')}>AutoPilot</a>
          <a href="#" className="nav-link" onClick={()=>console.log('Analytics clicked')}>Analytics</a>
        </div>
        <div className="navbar-right">
          <a href="#" className="nav-link" onClick={()=>console.log('Upload clicked')}>Upload</a>
          <a href="#" className="nav-link" onClick={()=>console.log('Manual Post clicked')}>Manual Post</a>
          <a href="#" className="nav-link" onClick={(e)=>navClick(e,'settings')}>Settings</a>
        </div>
      </nav>

      <div className="container">
        {/* Dashboard */}
        <div id="dashboard" className="page active">
          <div className="page-header">
            <h1 className="page-title vintage-accent">Dashboard</h1>
            <p className="page-subtitle">Command center for your social media empire</p>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card vintage-accent">
              <h3 className="card-title">🎯 Social Platforms</h3>
              <div className="btn-grid">
                <button className="btn btn-toggle" id="instagramToggle" onClick={()=>togglePlatform('instagram')}>📷 Instagram</button>
                <button className="btn btn-toggle" id="youtubeToggle" onClick={()=>togglePlatform('youtube')}>📺 YouTube</button>
              </div>
            </div>
            <div className="dashboard-card vintage-accent">
              <h3 className="card-title">⚡ Quick Actions</h3>
              <div className="btn-grid">
                <button className="btn" onClick={()=>console.log('View Smart Queue clicked')}>📋 Smart Queue</button>
                <button className="btn" id="recentToggle" onClick={toggleRecent}>👁️ Show Recent</button>
                <button className="btn btn-primary" onClick={()=>console.log('Post Now clicked')}>🚀 Post Now</button>
              </div>
            </div>
            <div className="dashboard-card vintage-accent">
              <h3 className="card-title">🎛️ Navigation</h3>
              <div className="btn-grid">
                <button className="btn" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>navClick(e as unknown as React.MouseEvent<HTMLAnchorElement>,'autopilot')}>🤖 AutoPilot Dashboard</button>
                <button className="btn" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>navClick(e as unknown as React.MouseEvent<HTMLAnchorElement>,'settings')}>⚙️ Settings</button>
              </div>
            </div>
          </div>
        </div>

        {/* AutoPilot */}
        <div id="autopilot" className="page">
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
                <button className="btn btn-primary" id="autopilotToggle" onClick={toggleAutoPilot}>🚀 Activate AutoPilot</button>
              </div>
            </div>
            <div className="dashboard-card vintage-accent">
              <h3 className="card-title">⚡ Quick Actions</h3>
              <div className="btn-grid">
                <button className="btn" onClick={()=>console.log('View Smart Queue clicked')}>📋 Smart Queue</button>
                <button className="btn btn-primary" onClick={()=>console.log('Post Now clicked')}>🚀 Post Now</button>
                <button className="btn" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>navClick(e as unknown as React.MouseEvent<HTMLAnchorElement>,'dashboard')}>← Back to Dashboard</button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div id="settings" className="page">
          <div className="page-header">
            <h1 className="page-title vintage-accent">Settings</h1>
            <p className="page-subtitle">Configure your connections and preferences</p>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card vintage-accent">
              <h3 className="card-title">💾 Configuration</h3>
              <div className="btn-grid">
                <button className="btn btn-primary" onClick={()=>console.log('Save Settings clicked')}>💾 Save Settings</button>
                <button className="btn" onClick={()=>console.log('Load Settings clicked')}>📂 Load Settings</button>
              </div>
            </div>
            <div className="dashboard-card vintage-accent">
              <h3 className="card-title">🔗 Social Media Tokens</h3>
              <div className="form-group">
                <label className="form-label">Instagram Access Token</label>
                <input type="password" className="form-input" placeholder="Enter Instagram token..." />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube API Key</label>
                <input type="password" className="form-input" placeholder="Enter YouTube API key..." />
              </div>
            </div>
            <div className="dashboard-card vintage-accent">
              <h3 className="card-title">☁️ Cloud Services</h3>
              <div className="form-group">
                <label className="form-label">AWS S3 Access Key</label>
                <input type="password" className="form-input" placeholder="Enter S3 access key..." />
              </div>
              <div className="form-group">
                <label className="form-label">AWS S3 Secret Key</label>
                <input type="password" className="form-input" placeholder="Enter S3 secret key..." />
              </div>
              <div className="form-group">
                <label className="form-label">MongoDB URI</label>
                <input type="password" className="form-input" placeholder="Enter MongoDB connection string..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
