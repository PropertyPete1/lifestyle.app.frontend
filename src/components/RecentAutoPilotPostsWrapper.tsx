'use client';
import React, { useEffect, useState } from 'react';
import RecentAutoPilotPosts from './RecentAutoPilotPosts';
import { fetchRecentPosts } from '@/utils/fetchRecentPosts';

type RecentItem = { title?: string; caption?: string; id?: string; platform?: string; source?: string };

export default function RecentAutoPilotPostsWrapper({ platform }: { platform: 'instagram' | 'youtube' }) {
  const [items, setItems] = useState<RecentItem[]>([]);
  useEffect(() => {
    (async () => {
      const { posts } = await fetchRecentPosts(platform);
      setItems((posts || []) as RecentItem[]);
    })();
  }, [platform]);
  return <RecentAutoPilotPosts items={items} />;
}

