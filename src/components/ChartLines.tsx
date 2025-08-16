"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  points?: number[]; // fallback single-series
  igSeries?: number[];
  ytSeries?: number[];
  height?: number;
  speedFactor?: number; // 1.0 normal; >1 faster
};

export default function ChartLines({ points = [], igSeries, ytSeries, height = 140, speedFactor = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dpr, setDpr] = useState(1);

  const mode: 'dual' | 'single' = igSeries || ytSeries ? 'dual' : 'single';
  const seriesA = useMemo(() => (mode === 'dual' ? (igSeries || []) : points), [mode, igSeries, points]);
  const seriesB = useMemo(() => (mode === 'dual' ? (ytSeries || []) : []), [mode, ytSeries]);

  const maxVal = useMemo(() => {
    const all = [...seriesA, ...seriesB];
    const m = Math.max(1, ...(all.length ? all : [1]));
    return m;
  }, [seriesA, seriesB]);

  useEffect(() => {
    const handleResize = () => {
      setDpr(Math.min(2, window.devicePixelRatio || 1));
      const el = canvasRef.current;
      const parent = containerRef.current;
      if (!el || !parent) return;
      const rect = parent.getBoundingClientRect();
      el.width = Math.floor(rect.width * dpr);
      el.height = Math.floor(height * dpr);
      el.style.width = `${rect.width}px`;
      el.style.height = `${height}px`;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height, dpr]);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = el.width;
      const heightPx = el.height;
      // Clear
      ctx.clearRect(0, 0, width, heightPx);
      // Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = Math.max(1, dpr * 1);
      const rows = 5;
      for (let r = 0; r <= rows; r++) {
        const y = (r / rows) * heightPx;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      ctx.restore();

      const drawSeries = (data: number[], colorMain: string, glow: string) => {
        if (!data.length) return;
        // Path
        ctx.save();
        ctx.lineWidth = Math.max(1.5, dpr * 1.5);
        ctx.strokeStyle = colorMain;
        ctx.beginPath();
        const n = data.length;
        const scroll = (t * 0.5) % 1; // 0..1 horizontal phase
        for (let i = 0; i < width; i++) {
          // map pixel to data index with scroll
          const u = (i / Math.max(1, width - 1)) * (n - 1);
          const idx = (u + scroll * (n - 1)) % (n - 1);
          const i0 = Math.floor(idx);
          const frac = idx - i0;
          const v0 = data[i0] || 0;
          const v1 = data[i0 + 1] ?? v0;
          const v = v0 + (v1 - v0) * frac;
          const y = heightPx - (v / maxVal) * (heightPx * 0.9) - heightPx * 0.05;
          if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
        }
        ctx.stroke();
        // Glow
        ctx.lineWidth = Math.max(4, dpr * 4);
        ctx.strokeStyle = glow;
        ctx.stroke();
        ctx.restore();
      };

      // Draw IG (pink) and YT (red)
      drawSeries(seriesA, 'rgba(255,105,180,0.9)', 'rgba(255,105,180,0.15)');
      drawSeries(seriesB, 'rgba(255,60,60,0.85)', 'rgba(255,60,60,0.12)');

      // Sparkle dots
      const sparkle = (data: number[], color: string) => {
        if (!data.length) return;
        const n = data.length;
        for (let s = 0; s < 8; s++) {
          const p = (s / 8 + (t % 1)) % 1;
          const u = p * (n - 1);
          const i0 = Math.floor(u);
          const v0 = data[i0] || 0; const v1 = data[i0 + 1] ?? v0; const frac = u - i0; const v = v0 + (v1 - v0) * frac;
          const x = Math.floor(p * width);
          const y = heightPx - (v / maxVal) * (heightPx * 0.9) - heightPx * 0.05;
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.arc(x, y, Math.max(1.5, dpr * 1.5), 0, Math.PI * 2);
          ctx.fill();
        }
      };
      sparkle(seriesA, 'rgba(255,105,180,0.9)');
      sparkle(seriesB, 'rgba(255,60,60,0.9)');

      // Advance time
      raf = requestAnimationFrame(render);
      const base = 0.6; // base scroll rate
      const speed = Math.max(0.2, Math.min(3, base * speedFactor));
      t += 0.006 * speed;
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [seriesA, seriesB, maxVal, dpr, speedFactor]);

  return (
    <div ref={containerRef} style={{ position: 'relative', height, marginTop: 12, borderRadius: 10, overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
      {/* Legend */}
      {mode === 'dual' && (
        <div style={{ position: 'absolute', right: 8, top: 6, display: 'flex', gap: 12, fontSize: 12, opacity: 0.9 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><i style={{ width:10, height:4, background:'hotpink', display:'inline-block', borderRadius:2 }} /> IG</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><i style={{ width:10, height:4, background:'#ff3c3c', display:'inline-block', borderRadius:2 }} /> YT</span>
        </div>
      )}
    </div>
  );
}

