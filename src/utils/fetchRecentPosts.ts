export async function fetchRecentPosts(platform: 'instagram' | 'youtube') {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_BASE_URL}/api/activity/feed?platform=${platform}&limit=5`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, posts: data.items || data.events || [] };
  } catch (e) {
    console.error('fetchRecentPosts error', e);
    return { success: false, posts: [] };
  }
}

