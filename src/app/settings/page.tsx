// TODO: Replace with the exact code you pasted previously. This placeholder keeps the route working.
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';
import { toast } from '@/components/NotificationSystem';

type SecretKey =
  | 'instagramToken'
  | 'igBusinessId'
  | 'facebookPageId'
  | 'youtubeAccessToken'
  | 'youtubeRefreshToken'
  | 'youtubeChannelId'
  | 'youtubeClientId'
  | 'youtubeClientSecret'
  | 'mongoURI'
  | 's3AccessKey'
  | 's3SecretKey'
  | 's3BucketName'
  | 's3Region'
  | 'openaiApiKey'
  | 'runwayApiKey'
  | 'dropboxToken';

type SecretsState = Record<SecretKey, string>;
type SecretsExisting = Record<SecretKey, boolean>;

type RepostStrategy = 'strict' | 'balanced' | 'loose';

type SettingsState = {
  autopilotEnabled: boolean;
  dailyLimit: number;
  repostDelay: number;
  repostStrategy: RepostStrategy;
  useTrendingAudio: boolean;
  enableVisualSimilarity: boolean;
  visualSimilarityRecentPosts: number;
  minimumIGLikesToRepost: number;
  minViews: number;
  showLineChart: boolean;
  enableHeartAnimations: boolean;
  showQueue: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  autopilotEnabled: true,
  dailyLimit: 3,
  repostDelay: 1,
  repostStrategy: 'balanced',
  useTrendingAudio: true,
  enableVisualSimilarity: true,
  visualSimilarityRecentPosts: 30,
  minimumIGLikesToRepost: 0,
  minViews: 0,
  showLineChart: true,
  enableHeartAnimations: true,
  showQueue: true,
};

const SECRET_LABELS: Record<SecretKey, string> = {
  instagramToken: 'Instagram Access Token',
  igBusinessId: 'IG Business Account ID',
  facebookPageId: 'Facebook Page ID',
  youtubeAccessToken: 'YouTube Token',
  youtubeRefreshToken: 'YouTube Refresh Token',
  youtubeChannelId: 'YouTube Channel ID',
  youtubeClientId: 'YouTube Client ID',
  youtubeClientSecret: 'YouTube Client Secret',
  mongoURI: 'MongoDB URI',
  s3AccessKey: 'S3 Access Key ID',
  s3SecretKey: 'S3 Secret Key',
  s3BucketName: 'S3 Bucket Name',
  s3Region: 'S3 Region',
  openaiApiKey: 'OpenAI API Key (optional)',
  runwayApiKey: 'Runway API Key (optional)',
  dropboxToken: 'Dropbox Token (optional)'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [secretsInput, setSecretsInput] = useState<SecretsState>(() => {
    const blank = {} as SecretsState;
    (Object.keys(SECRET_LABELS) as SecretKey[]).forEach(k => { blank[k] = ''; });
    return blank;
  });
  const [secretsExisting, setSecretsExisting] = useState<SecretsExisting>(() => {
    const init = {} as SecretsExisting;
    (Object.keys(SECRET_LABELS) as SecretKey[]).forEach(k => { init[k] = false; });
    return init;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.settings(), { cache: 'no-store' });
      const data = await res.json();

      const nextSettings: SettingsState = {
        autopilotEnabled: Boolean(data.autopilotEnabled ?? DEFAULT_SETTINGS.autopilotEnabled),
        dailyLimit: Number(data.dailyLimit ?? DEFAULT_SETTINGS.dailyLimit),
        repostDelay: Number(data.repostDelay ?? DEFAULT_SETTINGS.repostDelay),
        repostStrategy: (data.repostStrategy as RepostStrategy) ?? DEFAULT_SETTINGS.repostStrategy,
        useTrendingAudio: Boolean(data.useTrendingAudio ?? DEFAULT_SETTINGS.useTrendingAudio),
        enableVisualSimilarity: Boolean(data.enableVisualSimilarity ?? DEFAULT_SETTINGS.enableVisualSimilarity),
        visualSimilarityRecentPosts: Number(data.visualSimilarityRecentPosts ?? data.recentPostsToCheck ?? DEFAULT_SETTINGS.visualSimilarityRecentPosts),
        minimumIGLikesToRepost: Number(data.minimumIGLikesToRepost ?? DEFAULT_SETTINGS.minimumIGLikesToRepost),
        minViews: Number(data.minViews ?? DEFAULT_SETTINGS.minViews),
        showLineChart: Boolean(data.showLineChart ?? DEFAULT_SETTINGS.showLineChart),
        enableHeartAnimations: Boolean(data.enableHeartAnimations ?? DEFAULT_SETTINGS.enableHeartAnimations),
        showQueue: Boolean(data.showQueue ?? DEFAULT_SETTINGS.showQueue),
      };
      setSettings(nextSettings);

      const nextExisting = {} as SecretsExisting;
      (Object.keys(SECRET_LABELS) as SecretKey[]).forEach(key => {
        nextExisting[key] = Boolean((data as Record<string, unknown>)[key]);
      });
      setSecretsExisting(nextExisting);
    } catch (e) {
      toast.show('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // Persist UI preferences locally for snappy UX
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('settings_ui', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('settings_ui');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<SettingsState>;
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const setSecret = (key: SecretKey, value: string) => {
    setSecretsInput(prev => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        autopilotEnabled: settings.autopilotEnabled,
        dailyLimit: settings.dailyLimit,
        repostDelay: settings.repostDelay,
        repostStrategy: settings.repostStrategy,
        useTrendingAudio: settings.useTrendingAudio,
        enableVisualSimilarity: settings.enableVisualSimilarity,
        visualSimilarityRecentPosts: settings.visualSimilarityRecentPosts,
        minimumIGLikesToRepost: settings.minimumIGLikesToRepost,
        minViews: settings.minViews,
        showLineChart: settings.showLineChart,
        enableHeartAnimations: settings.enableHeartAnimations,
        showQueue: settings.showQueue,
      };

      (Object.keys(SECRET_LABELS) as SecretKey[]).forEach(key => {
        const val = secretsInput[key]?.trim();
        if (val && val.length > 0) payload[key] = val;
      });

      const res = await fetch(API_ENDPOINTS.settings(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Save failed');
      toast.show(json?.message || 'Settings saved');

      // Refresh existing flags; clear secret inputs
      const cleared = {} as SecretsState;
      (Object.keys(SECRET_LABELS) as SecretKey[]).forEach(k => { cleared[k] = ''; });
      setSecretsInput(cleared);
      await loadSettings();

      // Notify other pages (e.g., dashboard) that settings changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('settings-updated'));
      }
    } catch (e) {
      toast.show('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>Settings</h2>
        <a href="/dashboard" style={{ padding:'8px 12px', border:'1px solid rgba(255,255,255,.15)', borderRadius:8 }}>← Back</a>
      </div>

      {/* Credentials */}
      <Section title="Credentials">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
          {(Object.keys(SECRET_LABELS) as SecretKey[]).map((key) => (
            <Input
              key={key}
              label={SECRET_LABELS[key]}
              type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key') ? 'password' : 'text'}
              value={secretsInput[key]}
              onChange={(v) => setSecret(key, v)}
              placeholder={secretsExisting[key] && !secretsInput[key] ? '••••••••' : ''}
            />
          ))}
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
          Secrets are masked. They won’t be overwritten unless you enter a new value.
        </div>
      </Section>

      {/* Scheduler & Autopilot */}
      <Section title="Autopilot & Scheduler">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
          <Toggle label="AutoPilot Enabled" checked={settings.autopilotEnabled} onChange={(v)=>setSettings(s=>({ ...s, autopilotEnabled: v }))} />
          <Input label="Daily Post Limit" value={String(settings.dailyLimit)} onChange={(v)=>setSettings(s=>({ ...s, dailyLimit: Number(v||0) }))} />
          <Input label="Repost Delay (days)" value={String(settings.repostDelay)} onChange={(v)=>setSettings(s=>({ ...s, repostDelay: Number(v||0) }))} />
          <Select
            label="Repost Strategy"
            value={settings.repostStrategy}
            options={[{label:'Strict', value:'strict'},{label:'Balanced', value:'balanced'},{label:'Loose', value:'loose'}]}
            onChange={(v)=>setSettings(s=>({ ...s, repostStrategy: v as RepostStrategy }))}
          />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginTop:12 }}>
          <Toggle label="Use Trending Audio" checked={settings.useTrendingAudio} onChange={(v)=>setSettings(s=>({ ...s, useTrendingAudio: v }))} />
          <Toggle label="Enable Visual Similarity" checked={settings.enableVisualSimilarity} onChange={(v)=>setSettings(s=>({ ...s, enableVisualSimilarity: v }))} />
          <Input label="Visual Similarity Recent N" value={String(settings.visualSimilarityRecentPosts)} onChange={(v)=>setSettings(s=>({ ...s, visualSimilarityRecentPosts: Number(v||0) }))} />
          <Input label="Engagement Threshold (IG Likes)" value={String(settings.minimumIGLikesToRepost)} onChange={(v)=>setSettings(s=>({ ...s, minimumIGLikesToRepost: Number(v||0) }))} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginTop:12 }}>
          <Input label="Engagement Threshold (YT Views)" value={String(settings.minViews)} onChange={(v)=>setSettings(s=>({ ...s, minViews: Number(v||0) }))} />
        </div>
      </Section>

      {/* Visuals */}
      <Section title="Visuals">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          <Toggle label="Show Line Chart" checked={settings.showLineChart} onChange={(v)=>setSettings(s=>({ ...s, showLineChart: v }))} />
          <Toggle label="Enable Heart Animations" checked={settings.enableHeartAnimations} onChange={(v)=>setSettings(s=>({ ...s, enableHeartAnimations: v }))} />
          <Toggle label="Show Queue" checked={settings.showQueue} onChange={(v)=>setSettings(s=>({ ...s, showQueue: v }))} />
        </div>
      </Section>

      <div style={{ marginTop: 16, display:'flex', gap:8 }}>
        <button onClick={onSave} disabled={saving} style={btn()}>
          💾 Save Settings
        </button>
        {loading && <div style={{ opacity:.8 }}>Loading…</div>}
        {saving && <div style={{ opacity:.8 }}>Saving…</div>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:16, marginTop:16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder = '', type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
      <span style={{ opacity: .9 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: '#fff' }}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
      <span style={{ opacity: .9, minWidth: 160 }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{ cursor: 'pointer', padding: '6px 10px', border: '1px solid rgba(255,255,255,.2)', borderRadius: 999, background: checked ? 'rgba(0,200,255,.15)' : 'transparent' }}
      >
        {checked ? 'ON' : 'OFF'}
      </div>
    </label>
  );
}

function Select({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
      <span style={{ opacity: .9 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: '#fff' }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ color: '#000' }}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

function btn() {
  return { padding:'10px 12px', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, background:'transparent', color:'#fff', cursor:'pointer' } as React.CSSProperties;
}

