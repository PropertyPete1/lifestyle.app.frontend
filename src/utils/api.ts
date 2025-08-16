const normalizeBaseUrl = (raw?: string): string => {
  const fallback = 'http://localhost:10000';
  if (!raw) return fallback;
  // Take the first non-empty token if comma/space separated
  let source = (raw.split(/[\s,]+/).filter(Boolean)[0] || '').trim();
  if (!source) return fallback;
  // Fix common mistakes like http// or https//
  source = source.replace(/^http\/\//i, 'http://');
  source = source.replace(/^https\/\//i, 'https://');
  // If missing scheme, default to https
  if (!/^https?:\/\//i.test(source)) {
    source = `https://${source}`;
  }
  // Drop trailing slash
  source = source.replace(/\/+$/, '');
  return source;
};

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const withBase = (path: string) => `${API_BASE_URL}${path}`;

export const API_ENDPOINTS = {
  settings: () => withBase('/api/settings'),

  autopilotStatus: () => withBase('/api/autopilot/status'),
  autopilotQueue: (platform?: string, limit = 50, page = 1, q?: string) =>
    withBase(`/api/autopilot/queue${`?limit=${limit}&page=${page}`}${platform ? `&platform=${encodeURIComponent(platform)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  autopilotRun:       () => withBase('/api/autopilot/run'),
  autopilotRefill:    () => withBase('/api/autopilot/refill'),
  autopilotManualPost:() => withBase('/api/autopilot/manual-post'),
  autopilotQueuePrioritize: () => withBase('/api/autopilot/queue/prioritize'),
  autopilotQueueRemove:     () => withBase('/api/autopilot/queue/remove'),

  burstGet:           () => withBase('/api/burst'),
  burstPost:          () => withBase('/api/burst'),
  burstConfig:        () => withBase('/api/burst/config'),

  schedulerHealth:    () => withBase('/api/scheduler/health'),
  schedulerStatus:    () => withBase('/api/scheduler/status'),
  schedulerAutofill:  () => withBase('/api/scheduler/autofill'),

  diagReport:         () => withBase('/api/diag/autopilot-report'),
  diagReset:          () => withBase('/api/diag/reset-counters'),

  activityFeed: (platform?: string, limit = 20) =>
    withBase(`/api/activity/feed${platform ? `?platform=${platform}&limit=${limit}` : `?limit=${limit}`}`),

  analytics:          () => withBase('/api/analytics'),
  instagramAnalytics: () => withBase('/api/instagram/analytics'),
  youtubeAnalytics:   () => withBase('/api/youtube/analytics'),

  eventsRecent: (since: number) => withBase(`/api/events/recent?since=${since}`),
  chartStatus:        () => withBase('/api/chart/status'),
  queueSummary:       () => withBase('/api/queue/summary'),
  postNow:            () => withBase('/api/post-now'),

  // Upload helpers your UI calls:
  uploadDragDrop:     () => withBase('/api/upload/drag-drop'),
  uploadDragDropAlt:  () => withBase('/api/upload/dragdrop'),
  uploadRefreshCaption: () => withBase('/api/upload/refresh-caption'),
  uploadGetRealIGCaptions: () => withBase('/api/upload/get-real-instagram-captions'),
  uploadDirectVideo:  () => withBase('/api/upload/direct-video'),
  uploadSmartAnalyze: () => withBase('/api/upload/smart-video-analyze'),
  uploadDropboxFolder:() => withBase('/api/upload/dropbox-folder'),
  uploadSmartDrive:   () => withBase('/api/upload/smart-drive-sync'),
  syncDropbox:        () => withBase('/api/upload/sync-dropbox'),
  uploadDropbox:      () => withBase('/api/upload/dropbox'),
  uploadGoogleDrive:  () => withBase('/api/upload/google-drive'),

  // Heatmap demo endpoints exposed by backend refresh
  heatmapWeekly:      () => withBase('/api/heatmap/weekly'),
  heatmapOptimal:     () => withBase('/api/heatmap/optimal-times'),

  // Test tools
  testCleanup:        () => withBase('/api/test/cleanup'),
  testValidateAPIs:   () => withBase('/api/test/validate-apis'),
  testMongo:          () => withBase('/api/test/mongodb'),
  testUpload:         () => withBase('/api/test/upload'),
};

