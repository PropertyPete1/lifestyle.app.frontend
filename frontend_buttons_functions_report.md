## A) Buttons & Clickables (by page)

### Route: `/dashboard` — file: `src/app/dashboard/page.tsx`
- Label: "📷 Instagram"
  - Tag: `button`
  - File:Line: `src/app/dashboard/page.tsx:106`
  - Handler: inline `onClick={() => setPlatform('instagram')}`
  - Calls: none (state toggle)
  - Env used: n/a
  - Notes: toggles platform state affecting child fetches
- Label: "📺 YouTube"
  - Tag: `button`
  - File:Line: `src/app/dashboard/page.tsx:107`
  - Handler: inline `onClick={() => setPlatform('youtube')}`
  - Calls: none
  - Env used: n/a
- Label: "Reset"
  - Tag: `button`
  - File:Line: `src/app/dashboard/page.tsx:136`
  - Handler: inline; resets IG/YT visibility and smoothing
  - Calls: none
- Label: "ℹ️ Click a day to open queue"
  - Tag: `button`
  - File:Line: `src/app/dashboard/page.tsx:142-147`
  - Handler: inline; shows help text
  - Calls: none
- Clickable: ChartLines date click
  - Tag: `ChartLines` prop `onClickDate`
  - File:Line: `src/app/dashboard/page.tsx:128-134`
  - Handler: pushes to `/autopilot?platform=...&date=...`
  - Calls: client-side navigation only
- Section: Upcoming Scheduled row actions
  - Label: "🚀" (icon-only button)
    - Tag: `button`
    - File:Line: `src/app/dashboard/page.tsx:162-169`
    - Handler: inline async; POST `API_ENDPOINTS.postNow()` with `{ platform: pl, scope:'single', itemId }`
    - Calls: POST `/api/post-now`
    - Env: `NEXT_PUBLIC_API_URL` (via `API_ENDPOINTS`)
  - Label: "🗑"
    - Tag: `button`
    - File:Line: `src/app/dashboard/page.tsx:170-176`
    - Handler: inline async; POST `API_ENDPOINTS.autopilotQueueRemove()` with `{ itemId, platform }`
    - Calls: POST `/api/autopilot/queue/remove`
    - Env: `NEXT_PUBLIC_API_URL`
- Section: Quick Actions
  - Label: "🚀 Post Now (All)"
    - Tag: `button`
    - File:Line: `src/app/dashboard/page.tsx:206-217`
    - Handler: inline async; POST `API_ENDPOINTS.postNow()` with `{ platform:'both', scope:'next' }`
    - Calls: POST `/api/post-now`
    - Env: `NEXT_PUBLIC_API_URL`
  - Label: "Open AutoPilot"
    - Tag: `a`
    - File:Line: `src/app/dashboard/page.tsx:218`
    - Handler: link to `/autopilot`
    - Calls: none

### Route: `/autopilot` — file: `src/app/autopilot/page.tsx`
- Platform toggles
  - Labels: "📷 Instagram", "📺 YouTube"
  - Tag: `button`
  - File:Line: `src/app/autopilot/page.tsx:174-175`
  - Handler: set persisted platform in `localStorage`
  - Calls: none
- AutoPilot Control
  - Label: "🚀 Activate AutoPilot" (toggles UI state only)
  - Tag: `button`
  - File:Line: `src/app/autopilot/page.tsx:187`
  - Handler: `toggle()`; visual-only demo, no API call
- Quick Actions
  - Label: "🕷️ Scrape"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:193`
    - Calls: POST `API_ENDPOINTS.autopilotRun()` → `/api/autopilot/run`
    - Env: `NEXT_PUBLIC_API_URL`
  - Label: "♻️ Refill"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:194`
    - Calls: POST `/api/autopilot/refill`
  - Label: "🚀 Post Now ({platform})"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:195`
    - Calls: POST `/api/post-now` with `{ platform, scope:'all' }`
  - Label: "✋ Manual Post"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:196`
    - Calls: POST `/api/autopilot/manual-post`
  - Label: "📅 Autofill"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:197`
    - Calls: POST `/api/scheduler/autofill`
  - Label: "← Back to Dashboard"
    - Tag: `a`
    - File:Line: `src/app/autopilot/page.tsx:198`
    - Calls: none
- Burst Controls
  - Labels: "Burst ON", "Burst OFF"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:206-207`
    - Handler: `setBurst(true/false)` → POST `/api/autopilot/run`
  - Label: "💾 Save Config"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:218`
    - Calls: POST `/api/autopilot/run` with config payload
- Diagnostics
  - Label: "Run Diagnostics"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:225`
    - Calls: GET `/api/autopilot/run` (reads status)
- Smart Queue
  - Label: "Refresh Queue"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:233`
    - Calls: GET `/api/autopilot/queue?...`
  - Label: "Open Queue"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:235`
    - Calls: none (opens modal)
  - Modal row action: "Details"
    - Tag: `button`
    - File:Line: `src/app/autopilot/page.tsx:245`
    - Calls: none (opens detail side)
  - Modal controls:
    - "← Prev" / "Next →" — pagination
      - File:Line: `src/app/autopilot/page.tsx:312-313`
      - Calls: none (updates state; triggers fetch)
    - "✋ Manual Post"
      - File:Line: `src/app/autopilot/page.tsx:326-330`
      - Calls: POST `/api/autopilot/manual-post`
    - "🚀 Post Now"
      - File:Line: `src/app/autopilot/page.tsx:331-335`
      - Calls: POST `/api/post-now`
    - "⬆️ Prioritize"
      - File:Line: `src/app/autopilot/page.tsx:336-349`
      - Calls: POST `/api/autopilot/queue/prioritize`
    - "🗑 Remove"
      - File:Line: `src/app/autopilot/page.tsx:350-357`
      - Calls: POST `/api/autopilot/queue/remove`

### Route: `/analytics` — file: `src/app/analytics/page.tsx`
- Platform toggles: "📷 Instagram", "📺 YouTube"
  - File:Line: `src/app/analytics/page.tsx:56-57`
  - Calls: none (state)
- Fetches on load: GET `/api/analytics`, `/api/activity/feed?platform=...`, `/api/analytics/series?platform=...`, `/api/analytics/posts-per-hour?platform=...`, `/api/analytics/posts-per-weekday?platform=...`

### Route: `/settings` — file: `src/app/settings/page.tsx`
- Label: "💾 Save Settings"
  - Tag: `button`
  - File:Line: `src/app/settings/page.tsx:144`
  - Handler: `onSave`
  - Calls: POST `/api/settings`
  - Env: `NEXT_PUBLIC_API_URL`
- Label: "📂 Reload"
  - Tag: `button`
  - File:Line: `src/app/settings/page.tsx:145`
  - Calls: `location.reload()`

### Navbar — file: `src/components/Navbar.tsx`
- Links: "Upload", "Manual Post", "Settings", etc.
  - Upload/Manual Post anchor click has `preventDefault()` and console logs only (no API)

### Autopilot Switch — file: `src/components/AutopilotSwitch.tsx`
- Label: `input[type=checkbox]` + "Auto Pilot"
  - Calls: GET/POST `/api/settings` using `NEXT_PUBLIC_API_BASE` (different from rest of app)

---

## B) API calls referenced in the frontend

Source: `src/utils/api.ts` builder uses `API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL)`

- GET `/api/settings` — Name: `API_ENDPOINTS.settings()`
  - Used by: `src/app/settings/page.tsx` (load and refresh); `src/components/AutopilotSwitch.tsx` uses direct `${API_BASE}/api/settings`
  - Env: `NEXT_PUBLIC_API_URL` (most) / `NEXT_PUBLIC_API_BASE` (AutopilotSwitch)
- GET `/api/autopilot/status` — `API_ENDPOINTS.autopilotStatus()`
  - Used by: Dashboard load
- GET `/api/autopilot/queue?...` — `API_ENDPOINTS.autopilotQueue(platform, ...)`
  - Used by: Dashboard load (scheduled:true); Autopilot queue modal and refresh
- POST `/api/autopilot/run` — `API_ENDPOINTS.autopilotRun()`
  - Used by: Autopilot Scrape, Burst toggle/config, Diagnostics (GET also via same endpoint)
- POST `/api/autopilot/refill` — `API_ENDPOINTS.autopilotRefill()`
  - Used by: Autopilot "Refill"
- POST `/api/autopilot/manual-post` — `API_ENDPOINTS.autopilotManualPost()`
  - Used by: Autopilot Quick Actions and Modal
- POST `/api/autopilot/queue/prioritize` — `API_ENDPOINTS.autopilotQueuePrioritize()`
  - Used by: Autopilot Modal "Prioritize"
- POST `/api/autopilot/queue/remove` — `API_ENDPOINTS.autopilotQueueRemove()`
  - Used by: Dashboard Upcoming list; Autopilot Modal "Remove"
- GET `/api/burst` — `API_ENDPOINTS.burstGet()`; POST `/api/burst` — `API_ENDPOINTS.burstPost()`; POST `/api/burst/config` — `API_ENDPOINTS.burstConfig()`
  - Used by: Dashboard load; Autopilot Burst config save (currently posts to `/api/autopilot/run` instead)
- GET `/api/scheduler/health` — `API_ENDPOINTS.schedulerHealth()`
- GET `/api/scheduler/status` — `API_ENDPOINTS.schedulerStatus()`
- POST `/api/scheduler/autofill` — `API_ENDPOINTS.schedulerAutofill()`
  - Used by: Autopilot "Autofill"
- GET `/api/diag/autopilot-report` — `API_ENDPOINTS.diagReport()`
- POST `/api/diag/reset-counters` — `API_ENDPOINTS.diagReset()`
- GET `/api/activity/feed` — `API_ENDPOINTS.activityFeed(platform, limit)`
  - Used by: Analytics page (recent IG/YT activity)
- GET `/api/activity/recent-posts` — `API_ENDPOINTS.activityRecentPosts(platform, limit)`
  - Used by: Dashboard "Recently Posted"
- GET `/api/analytics` — `API_ENDPOINTS.analytics()`
  - Used by: Dashboard and Analytics
- GET `/api/analytics/series?days=&platform=` — `API_ENDPOINTS.analyticsSeries()`
  - Used by: Dashboard and Analytics
- GET `/api/analytics/posts-per-hour?platform=` — `API_ENDPOINTS.analyticsPostsPerHour()`
  - Used by: Analytics
- GET `/api/analytics/posts-per-weekday?platform=` — `API_ENDPOINTS.analyticsPostsPerWeekday()`
  - Used by: Analytics
- GET `/api/chart/status` — `API_ENDPOINTS.chartStatus()`
- GET `/api/queue/summary` — `API_ENDPOINTS.queueSummary()`
- POST `/api/post-now` — `API_ENDPOINTS.postNow()`
  - Used by: Dashboard Quick Action, Dashboard upcoming row, Autopilot modal and button
- Upload helpers — not wired in current UI (placeholders available in `API_ENDPOINTS`)
- Heatmap
  - GET `/api/heatmap/weekly` — `API_ENDPOINTS.heatmapWeekly()`
  - GET `/api/heatmap/optimal-times?platform=` — `API_ENDPOINTS.heatmapOptimal()`
  - Used by: `src/components/ActivityHeatmap.tsx`

Highlighted routes presence in UI:
- `/api/diag/schedule/status` — used indirectly in past widgets; current UI builds schedule from `/api/autopilot/queue?scheduled=true`
- `/api/diag/schedule/set` — not referenced
- `/api/diag/schedule/repair` — not referenced
- `/api/diag/schedule/trim` — not referenced in UI
- `/api/autopilot/prime-fixed` — not referenced
- `/api/diag/scheduler-kick` — not referenced
- `/api/diag/health-queue` — not referenced
- `/api/diag/autopilot-report` — available, not wired
- `/api/autopilot/queue?platform=...` — referenced widely
- `/api/diag/pool/*` — not referenced
- `/api/diag/cleanup` — not referenced
- `/api/metrics/youtube` — not referenced in UI (diagnostics-only)
- `/api/diag/yt/*`, `/api/diag/ig/*` — not referenced in UI

Env dependencies:
- Most API usage relies on `NEXT_PUBLIC_API_URL` via `API_ENDPOINTS`
- `AutopilotSwitch` uniquely uses `NEXT_PUBLIC_API_BASE` (mismatch)
- `SchedulePanel` (client) supports `process.env.NEXT_PUBLIC_API_URL` and `window.__API_BASE__` fallback

---

## C) Exported functions & utilities

- `API_ENDPOINTS` (api client)
  - Kind: utility factory
  - File: `src/utils/api.ts:23-79`
  - Used by: Dashboard, Autopilot, Analytics, Settings, ActivityHeatmap
  - Mentions endpoints: yes — numerous (see above)
- `diagScheduleStatus`, `upcomingBoth` (helpers)
  - Kind: utility
  - File: `src/utils/api.ts:89-100`
  - Used by: not referenced in current pages
  - Endpoints: `/api/diag/schedule/status`, `/api/autopilot/queue?...`
- `displayIso`, `formatLocal`, `type QueueItem` (time helpers)
  - Kind: utility/types
  - File: `src/lib/time.ts`
  - Used by: Dashboard, Autopilot
  - Endpoints: no
- `ToastProvider`, `useToast`
  - Kind: component/hook
  - File: `src/components/Toast.tsx`
  - Used by: Dashboard, Autopilot
  - Endpoints: no
- `ActivityHeatmap`
  - Kind: component
  - File: `src/components/ActivityHeatmap.tsx`
  - Used by: Dashboard, Analytics
  - Endpoints: heatmap weekly/optimal
- `AutopilotSwitch`
  - Kind: component
  - File: `src/components/AutopilotSwitch.tsx`
  - Used by: Dashboard
  - Endpoints: `GET/POST /api/settings` via `NEXT_PUBLIC_API_BASE`
- `ChartLines`, `ChartWave`
  - Kind: components
  - Files: `src/components/ChartLines.tsx`, `src/components/ChartWave.tsx`
  - Used by: Dashboard, Analytics
  - Endpoints: no (pure client viz)

---

## D) Pages & Routes map

- `/` — file: `src/app/page.tsx`
  - Key children: Navbar, container; (landing content minimal)
- `/dashboard` — file: `src/app/dashboard/page.tsx`
  - Children: AutopilotSwitch, ChartWave, ChartLines, ActivityHeatmap; inline buttons (Post Now, remove, etc.)
- `/autopilot` — file: `src/app/autopilot/page.tsx`
  - Children: Quick actions, Burst controls, Diagnostics, Smart Queue modal
- `/analytics` — file: `src/app/analytics/page.tsx`
  - Children: ActivityHeatmap, ChartLines; fetch-only controls
- `/settings` — file: `src/app/settings/page.tsx`
  - Children: Inputs for credentials; Save/Reload buttons

---

## E) Gaps / Mismatches

- Env mismatch: `AutopilotSwitch` uses `NEXT_PUBLIC_API_BASE` whereas the rest of the app uses `NEXT_PUBLIC_API_URL`. Risk of “wrong base URL” if only one env is set.
- Endpoint mapping typo: `autopilotQueuePrioritizeEndpoint` in `src/utils/api.ts:102-105` returns `API_ENDPOINTS.autopilotQueueRemove()` (remove) instead of prioritize. UI uses the correct `API_ENDPOINTS.autopilotQueuePrioritize()` elsewhere, but the helper alias is wrong.
- Overloaded endpoint: Several Autopilot actions (Scrape, Burst config/save, Diagnostics) all hit `/api/autopilot/run`. Consider distinct endpoints for clarity, or keep as-is with clear payloads.
- Scheduler diagnostics endpoints (e.g., `/api/diag/schedule/*`) are not wired in current UI; schedule shown on dashboard is derived from `/api/autopilot/queue?scheduled=true`.
- Metrics diagnostics endpoints (`/api/metrics/youtube`, `/api/diag/yt/*`) are not wired into the UI; expected as diagnostics-only.

---

## F) Quick summary for wiring (top relevant buttons)

1) Dashboard "🚀 Post Now (All)" → POST `/api/post-now` with `{ platform:'both', scope:'next' }`
2) Dashboard upcoming row "🚀" → POST `/api/post-now` with `{ platform, scope:'single', itemId }`
3) Dashboard upcoming row "🗑" → POST `/api/autopilot/queue/remove` with `{ itemId, platform }`
4) Autopilot "🕷️ Scrape" → POST `/api/autopilot/run` with `{ platform }`
5) Autopilot "♻️ Refill" → POST `/api/autopilot/refill` with `{ platform }`
6) Autopilot "✋ Manual Post" (Quick) → POST `/api/autopilot/manual-post` with `{ platform }`
7) Autopilot "📅 Autofill" → POST `/api/scheduler/autofill` with `{ platform }`
8) Autopilot Modal "✋ Manual Post" → POST `/api/autopilot/manual-post` with `{ platform, itemId }`
9) Autopilot Modal "🚀 Post Now" → POST `/api/post-now` with `{ platform, scope:'single', itemId }`
10) Autopilot Modal "⬆️ Prioritize" → POST `/api/autopilot/queue/prioritize` with `{ platform, itemId }`

Env to ensure:
- Set `NEXT_PUBLIC_API_URL=https://lifestyle-app-backend.onrender.com` (primary)
- Optionally align `AutopilotSwitch` to use the same env or ensure `NEXT_PUBLIC_API_BASE` matches

Report generated from: `/Users/peterallen/Lifestyle Design Auto Poster/lifestyle.app.backend/lifestyle.app.frontend` (read-only scan)
