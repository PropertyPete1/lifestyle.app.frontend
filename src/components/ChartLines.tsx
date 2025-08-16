"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  points?: number[]; // fallback single-series
  igSeries?: number[];
  ytSeries?: number[];
  height?: number;
  speedFactor?: number; // 1.0 normal; >1 faster
  dates?: string[]; // optional labels for ticks/tooltip
  smoothing?: boolean; // moving average smoothing
  showIG?: boolean;
  showYT?: boolean;
  onToggleIG?: (show: boolean) => void;
  onToggleYT?: (show: boolean) => void;
  onToggleSmoothing?: (smooth: boolean) => void;
  onClickDate?: (date: string) => void;
};

export default function ChartLines({ points = [], igSeries, ytSeries, height = 140, speedFactor = 1, dates = [], smoothing = false, showIG = true, showYT = true, onToggleIG, onToggleYT, onToggleSmoothing, onClickDate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dpr, setDpr] = useState(1);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const mode: 'dual' | 'single' = igSeries || ytSeries ? 'dual' : 'single';
  const seriesA = useMemo(() => (mode === 'dual' ? (igSeries || []) : points), [mode, igSeries, points]);
  const seriesB = useMemo(() => (mode === 'dual' ? (ytSeries || []) : []), [mode, ytSeries]);

  const maxVal = useMemo(() => {
    const all = [ ...(showIG ? seriesA : []), ...(showYT ? seriesB : []) ];
    const m = Math.max(1, ...(all.length ? all : [1]));
    return m;
  }, [seriesA, seriesB, showIG, showYT]);

  const smooth = (data: number[], windowSize = 7): number[] => {
    if (!smoothing || windowSize <= 1) return data;
    const out: number[] = new Array(data.length).fill(0);
    let acc = 0;
    for (let i = 0; i < data.length; i++) {
      acc += data[i] || 0;
      if (i >= windowSize) acc -= data[i - windowSize] || 0;
      const denom = i < windowSize ? (i + 1) : windowSize;
      out[i] = acc / denom;
    }
    return out;
  };

  const sA = useMemo(() => smooth(seriesA, 7), [seriesA, smoothing]);
  const sB = useMemo(() => smooth(seriesB, 7), [seriesB, smoothing]);

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

      const drawSeries = (data: number[], colorMain: string, glowBase: string) => {
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
        const glowAlpha = Math.max(0.06, Math.min(0.28, 0.12 * speedFactor));
        ctx.lineWidth = Math.max(4, dpr * 4);
        ctx.strokeStyle = glowBase.replace(/\d?\.\d+\)/, `${glowAlpha})`);
        ctx.stroke();
        ctx.restore();
      };

      // Draw IG (pink) and YT (red)
      if (showIG) drawSeries(sA, 'rgba(255,105,180,0.9)', 'rgba(255,105,180,0.15)');
      if (showYT) drawSeries(sB, 'rgba(255,60,60,0.85)', 'rgba(255,60,60,0.12)');

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
      if (showIG) sparkle(sA, 'rgba(255,105,180,0.9)');
      if (showYT) sparkle(sB, 'rgba(255,60,60,0.9)');

      // Day ticks (every 7th index based on provided dates)
      if (dates.length > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = Math.max(1, dpr);
        const n = dates.length;
        const step = 7;
        for (let i = 0; i < n; i += step) {
          const x = Math.floor((i / Math.max(1, n - 1)) * width);
          ctx.beginPath(); ctx.moveTo(x, heightPx - 1); ctx.lineTo(x, heightPx - Math.max(8, dpr * 8)); ctx.stroke();
          const label = (dates[i] || '').slice(5); // MM-DD
          ctx.font = `${Math.max(10, dpr * 10)}px system-ui`;
          ctx.textAlign = 'center';
          ctx.fillText(label, x, heightPx - Math.max(12, dpr * 12));
        }
        ctx.restore();
      }

      // Hover tooltip
      if (hoverX != null) {
        const xPx = hoverX * width;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = Math.max(1, dpr);
        ctx.beginPath(); ctx.moveTo(xPx, 0); ctx.lineTo(xPx, heightPx); ctx.stroke();

        const drawPointInfo = (data: number[], color: string) => {
          if (!data.length) return { y: 0, val: 0 };
          const n = data.length;
          const u = hoverX * (n - 1);
          const i0 = Math.floor(u);
          const v0 = data[i0] || 0; const v1 = data[i0 + 1] ?? v0; const frac = u - i0; const v = v0 + (v1 - v0) * frac;
          const y = heightPx - (v / maxVal) * (heightPx * 0.9) - heightPx * 0.05;
          ctx.beginPath(); ctx.fillStyle = color; ctx.arc(xPx, y, Math.max(2, dpr * 2), 0, Math.PI * 2); ctx.fill();
          return { y, val: v };
        };
        const a = showIG ? drawPointInfo(sA, 'hotpink') : { y: 0, val: 0 };
        const b = showYT ? drawPointInfo(sB, '#ff3c3c') : { y: 0, val: 0 };
        const dateIdx = dates.length ? Math.round(hoverX * (dates.length - 1)) : -1;
        const dateStr = dateIdx >= 0 ? dates[dateIdx] : '';
        const lines = [dateStr && `📅 ${dateStr}`, showIG && `IG: ${Math.round(a.val)}`, showYT && `YT: ${Math.round(b.val)}`].filter(Boolean) as string[];
        const boxW = 120, boxH = 16 * lines.length + 10;
        const bx = Math.min(width - boxW - 4, Math.max(4, xPx + 8));
        const by = 8;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = Math.max(1, dpr);
        ctx.beginPath(); ctx.rect(bx, by, boxW, boxH); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'white'; ctx.font = `${Math.max(11, dpr * 11)}px system-ui`;
        lines.forEach((txt, i) => ctx.fillText(txt, bx + 8, by + 18 + i * 16));
        ctx.restore();
      }

      // Advance time
      raf = requestAnimationFrame(render);
      const base = 0.6; // base scroll rate
      const speed = Math.max(0.2, Math.min(3, base * speedFactor));
      t += 0.006 * speed;
    };
    raf = requestAnimationFrame(render);
  }, [seriesA, seriesB, maxVal, dpr, speedFactor, dates, hoverX, sA, sB, showIG, showYT]);

  const onClick = () => {
    if (onClickDate && hoverX != null && dates.length) {
      const idx = Math.round(hoverX * (dates.length - 1));
      onClickDate(dates[idx]);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', height, marginTop: 12, borderRadius: 10, overflow: 'hidden' }}
         onClick={onClick}
         onMouseMove={(e)=>{
           const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
           const x = (e.clientX - rect.left) / Math.max(1, rect.width);
           setHoverX(Math.max(0, Math.min(1, x)));
         }}
         onMouseLeave={()=> setHoverX(null)}>
      <canvas ref={canvasRef} />
      {/* Overlay controls */}
      {mode === 'dual' && (
        <div style={{ position: 'absolute', right: 8, top: 6, display: 'flex', gap: 12, fontSize: 12, alignItems:'center' }}>
          <label style={{ display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer' }}>
            <input type="checkbox" checked={showIG} onChange={(e)=> onToggleIG?.(e.target.checked)} />
            <i style={{ width:10, height:4, background:'hotpink', display:'inline-block', borderRadius:2 }} /> IG
          </label>
          <label style={{ display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer' }}>
            <input type="checkbox" checked={showYT} onChange={(e)=> onToggleYT?.(e.target.checked)} />
            <i style={{ width:10, height:4, background:'#ff3c3c', display:'inline-block', borderRadius:2 }} /> YT
          </label>
          <label style={{ display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer' }}>
            <input type="checkbox" checked={smoothing} onChange={(e)=> onToggleSmoothing?.(e.target.checked)} /> Smooth
          </label>
        </div>
      )}
    </div>
  );
}

