"use client";
import { useEffect, useRef } from 'react';

export default function ChartWave({ height = 120, speed = 0.015 }: { height?: number; speed?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let t = 0;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += speed;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const draw = (amp: number, freq: number, color: string, alpha: number) => {
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y = h/2 + Math.sin(x * freq + t * 3) * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      // teal → cyan → pink palette
      draw(16, 0.012, '0,255,136', 0.35);
      draw(12, 0.018, '0,204,255', 0.28);
      draw(22, 0.009,  '255,0,128', 0.18);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [height, speed]);

  return <canvas ref={ref} style={{ width:'100%', display:'block', borderRadius:12 }} />;
}

