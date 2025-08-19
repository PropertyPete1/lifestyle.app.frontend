/* eslint-disable @typescript-eslint/no-explicit-any */
export function filterVerifiedRecent(items: any[]): any[] {
  const list = Array.isArray(items) ? items : [];
  const now = Date.now();
  const FORTY_EIGHT_HOURS = 1000 * 60 * 60 * 48;

  return list
    .filter(Boolean)
    .filter((it: any) => {
      const status = String(it?.status ?? it?.meta?.status ?? '').toLowerCase();
      if (status !== 'posted') return false;

      const platform = String(it?.platform ?? it?.meta?.platform ?? '').toLowerCase();
      const postedAtMs = new Date(
        it?.postedAt ?? it?.updatedAt ?? it?.createdAt ?? 0
      ).getTime();
      const isFresh = Number.isFinite(postedAtMs)
        ? now - postedAtMs < FORTY_EIGHT_HOURS
        : true;

      const igPermalink =
        it?.igPermalink ?? it?.meta?.igPermalink ?? it?.permalink ?? null;
      const ytVideoId =
        it?.ytVideoId ?? it?.meta?.ytVideoId ?? it?.videoId ?? null;

      if (platform === 'instagram') return Boolean(igPermalink) && isFresh;
      if (platform === 'youtube') return Boolean(ytVideoId) && isFresh;
      return isFresh;
    });
}



