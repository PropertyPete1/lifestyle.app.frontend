'use client';
import { useEffect, useRef } from 'react';

export default function VideoThumbnail({ videoUrl, style }: { videoUrl: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current!;
    v.addEventListener('loadeddata', () => { v.currentTime = 0.1; });
  }, []);
  return (
    <video ref={ref} src={videoUrl} muted style={{ width: '100%', borderRadius: 10, ...style }} />
  );
}

