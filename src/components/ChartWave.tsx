'use client';
import { useEffect, useRef } from 'react';

export default function ChartWave({ height = 80, speed = 0.015 }: { height?: number; speed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
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

      const draw = (amp: number, freq: number, alpha: number) => {
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y = h/2 + Math.sin(x * freq + t * 3) * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      draw(12, 0.015, 0.35);
      draw(8,  0.022, 0.25);
      draw(18, 0.010, 0.18);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [height, speed]);

  return <canvas ref={canvasRef} style={{ width: '100%', display: 'block', opacity: 0.85 }} />;
}

