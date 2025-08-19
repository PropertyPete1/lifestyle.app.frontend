'use client';

import * as React from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'https://lifestyle-app-backend.onrender.com';

export default function AutopilotSwitch() {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Hydrate from server on mount (no caching)
  React.useEffect(() => {
    let alive = true;
    const ac = new AbortController();

    (async () => {
      try {
        setError(null);
        const r = await fetch(`${API_BASE}/api/settings`, {
          cache: 'no-store',
          signal: ac.signal,
        });
        const s = await r.json();
        if (!alive) return;
        setEnabled(Boolean(s.autopilotEnabled));
      } catch (e) {
        if (!alive) return;
        setError('Failed to load settings');
        setEnabled(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, []);

  async function onToggle(next: boolean) {
    setSaving(true);
    setEnabled(next); // optimistic
    try {
      const r = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ autopilotEnabled: next }),
      });
      const s = await r.json();
      setEnabled(Boolean(s.autopilotEnabled)); // source of truth
    } catch (e) {
      setError('Save failed');
      setEnabled((prev) => !next); // revert
    } finally {
      setSaving(false);
    }
  }

  if (enabled === null) {
    return <button disabled>Loading…</button>;
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={!!enabled}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={saving}
        />
        Auto Pilot
      </label>
      {saving && <span>Saving…</span>}
      {error && <span style={{ color: 'crimson' }}>{error}</span>}
    </div>
  );
}



