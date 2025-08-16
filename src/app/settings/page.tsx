'use client';

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';

type SecretKey =
  | 'instagramToken'
  | 'igBusinessId'
  | 'facebookPageId'
  | 'youtubeAccessToken'
  | 'youtubeRefreshToken'
  | 'youtubeChannelId'
  | 'youtubeClientId'
  | 'youtubeClientSecret'
  | 's3AccessKey'
  | 's3SecretKey'
  | 's3BucketName'
  | 's3Region'
  | 'mongoURI'
  | 'openaiApiKey'
  | 'runwayApiKey'
  | 'dropboxToken';

const LABELS: Record<SecretKey, string> = {
  instagramToken: 'Instagram Access Token',
  igBusinessId: 'IG Business Account ID',
  facebookPageId: 'Facebook Page ID',
  youtubeAccessToken: 'YouTube Access Token',
  youtubeRefreshToken: 'YouTube Refresh Token',
  youtubeChannelId: 'YouTube Channel ID',
  youtubeClientId: 'YouTube Client ID',
  youtubeClientSecret: 'YouTube Client Secret',
  s3AccessKey: 'AWS S3 Access Key',
  s3SecretKey: 'AWS S3 Secret Key',
  s3BucketName: 'S3 Bucket Name',
  s3Region: 'S3 Region',
  mongoURI: 'MongoDB URI',
  openaiApiKey: 'OpenAI API Key (optional)',
  runwayApiKey: 'Runway API Key (optional)',
  dropboxToken: 'Dropbox Token (optional)'
};

export default function SettingsPage() {
  const [inputs, setInputs] = useState<Record<SecretKey, string>>({
    instagramToken: '', igBusinessId: '', facebookPageId: '',
    youtubeAccessToken: '', youtubeRefreshToken: '', youtubeChannelId: '', youtubeClientId: '', youtubeClientSecret: '',
    s3AccessKey: '', s3SecretKey: '', s3BucketName: '', s3Region: '', mongoURI: '', openaiApiKey: '', runwayApiKey: '', dropboxToken: ''
  });
  const [configured, setConfigured] = useState<Record<SecretKey, boolean>>({
    instagramToken: false, igBusinessId: false, facebookPageId: false,
    youtubeAccessToken: false, youtubeRefreshToken: false, youtubeChannelId: false, youtubeClientId: false, youtubeClientSecret: false,
    s3AccessKey: false, s3SecretKey: false, s3BucketName: false, s3Region: false, mongoURI: false, openaiApiKey: false, runwayApiKey: false, dropboxToken: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.settings(), { cache: 'no-store' });
        const data = await res.json();
        const nextConfigured: Record<SecretKey, boolean> = { ...configured };
        (Object.keys(LABELS) as SecretKey[]).forEach((k) => {
          const v = String((data || {})[k] || '');
          nextConfigured[k] = v.startsWith('✅');
        });
        setConfigured(nextConfigured);
      } catch {
        // ignore
      } finally { setLoading(false); }
    })();
  }, []);

  const setVal = (k: SecretKey, v: string) => setInputs((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      (Object.keys(LABELS) as SecretKey[]).forEach((k) => {
        const v = inputs[k]?.trim();
        if (v) payload[k] = v;
      });
      if (Object.keys(payload).length === 0) { setSaving(false); return; }
      const res = await fetch(API_ENDPOINTS.settings(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Save failed');
      // clear inputs after save
      const cleared: Record<SecretKey, string> = { ...inputs };
      (Object.keys(LABELS) as SecretKey[]).forEach((k) => { cleared[k] = ''; });
      setInputs(cleared);
      // reload configured flags
      const s = await fetch(API_ENDPOINTS.settings(), { cache: 'no-store' }).then((r) => r.json());
      const nextConfigured: Record<SecretKey, boolean> = { ...configured };
      (Object.keys(LABELS) as SecretKey[]).forEach((k) => {
        const v = String((s || {})[k] || '');
        nextConfigured[k] = v.startsWith('✅');
      });
      setConfigured(nextConfigured);
    } catch {
      // ignore
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title vintage-accent">Settings</h1>
        <p className="page-subtitle">Configure your connections and preferences</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🔗 Social Media Tokens</h3>
          {(['instagramToken','igBusinessId','facebookPageId','youtubeAccessToken','youtubeRefreshToken','youtubeChannelId','youtubeClientId','youtubeClientSecret'] as SecretKey[]).map((k) => (
            <div key={k} className="form-group">
              <label className="form-label">{LABELS[k]} {configured[k] && <span style={{opacity:.7}}>(configured)</span>}</label>
              <input type={k.toLowerCase().includes('secret')||k.toLowerCase().includes('token')||k.toLowerCase().includes('key')?'password':'text'} className="form-input" placeholder={configured[k] ? '••••••••' : `Enter ${LABELS[k]}...`} value={inputs[k]} onChange={(e)=>setVal(k, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">☁️ Cloud & Database</h3>
          {(['s3AccessKey','s3SecretKey','s3BucketName','s3Region','mongoURI'] as SecretKey[]).map((k) => (
            <div key={k} className="form-group">
              <label className="form-label">{LABELS[k]} {configured[k] && <span style={{opacity:.7}}>(configured)</span>}</label>
              <input type={k.toLowerCase().includes('secret')||k.toLowerCase().includes('token')||k.toLowerCase().includes('key')||k==='mongoURI'?'password':'text'} className="form-input" placeholder={configured[k] ? '••••••••' : `Enter ${LABELS[k]}...`} value={inputs[k]} onChange={(e)=>setVal(k, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">🧠 Optional Integrations</h3>
          {(['openaiApiKey','runwayApiKey','dropboxToken'] as SecretKey[]).map((k) => (
            <div key={k} className="form-group">
              <label className="form-label">{LABELS[k]} {configured[k] && <span style={{opacity:.7}}>(configured)</span>}</label>
              <input type="password" className="form-input" placeholder={configured[k] ? '••••••••' : `Enter ${LABELS[k]}...`} value={inputs[k]} onChange={(e)=>setVal(k, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="dashboard-card vintage-accent">
          <h3 className="card-title">💾 Configuration</h3>
          <div className="btn-grid">
            <button className="btn btn-primary" onClick={onSave} disabled={saving || loading}>💾 Save Settings</button>
            <button className="btn" onClick={()=>location.reload()} disabled={loading}>📂 Reload</button>
          </div>
        </div>
      </div>
    </div>
  );
}
