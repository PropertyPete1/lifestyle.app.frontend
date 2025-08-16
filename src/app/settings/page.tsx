'use client';

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title vintage-accent">Settings</h1>
        <p className="page-subtitle">Configure your connections and preferences</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🔗 Social Media Tokens</h3>
          <div className="form-group"><label className="form-label">Instagram Access Token</label><input type="password" className="form-input" placeholder="Enter Instagram token..." /></div>
          <div className="form-group"><label className="form-label">IG Business Account ID</label><input type="text" className="form-input" placeholder="Enter IG Business ID..." /></div>
          <div className="form-group"><label className="form-label">Facebook Page ID</label><input type="text" className="form-input" placeholder="Enter Facebook Page ID..." /></div>
          <div className="form-group"><label className="form-label">YouTube Access Token</label><input type="password" className="form-input" placeholder="Enter YouTube access token..." /></div>
          <div className="form-group"><label className="form-label">YouTube Refresh Token</label><input type="password" className="form-input" placeholder="Enter YouTube refresh token..." /></div>
          <div className="form-group"><label className="form-label">YouTube Channel ID</label><input type="text" className="form-input" placeholder="Enter YouTube Channel ID..." /></div>
          <div className="form-group"><label className="form-label">YouTube Client ID</label><input type="text" className="form-input" placeholder="Enter YouTube Client ID..." /></div>
          <div className="form-group"><label className="form-label">YouTube Client Secret</label><input type="password" className="form-input" placeholder="Enter YouTube Client Secret..." /></div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">☁️ Cloud & Database</h3>
          <div className="form-group"><label className="form-label">AWS S3 Access Key</label><input type="password" className="form-input" placeholder="Enter S3 access key..." /></div>
          <div className="form-group"><label className="form-label">AWS S3 Secret Key</label><input type="password" className="form-input" placeholder="Enter S3 secret key..." /></div>
          <div className="form-group"><label className="form-label">S3 Bucket Name</label><input type="text" className="form-input" placeholder="Enter S3 bucket name..." /></div>
          <div className="form-group"><label className="form-label">S3 Region</label><input type="text" className="form-input" placeholder="Enter S3 region..." /></div>
          <div className="form-group"><label className="form-label">MongoDB URI</label><input type="password" className="form-input" placeholder="Enter MongoDB connection string..." /></div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🧠 Optional Integrations</h3>
          <div className="form-group"><label className="form-label">OpenAI API Key</label><input type="password" className="form-input" placeholder="Enter OpenAI API key..." /></div>
          <div className="form-group"><label className="form-label">Runway API Key</label><input type="password" className="form-input" placeholder="Enter Runway API key..." /></div>
          <div className="form-group"><label className="form-label">Dropbox Token</label><input type="password" className="form-input" placeholder="Enter Dropbox OAuth token..." /></div>
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">💾 Configuration</h3>
          <div className="btn-grid">
            <button className="btn btn-primary" onClick={()=>console.log('Save Settings clicked')}>💾 Save Settings</button>
            <button className="btn" onClick={()=>console.log('Load Settings clicked')}>📂 Load Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
