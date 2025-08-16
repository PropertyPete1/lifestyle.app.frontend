'use client';
import React, { useEffect, useRef } from 'react';

export const toast = {
  show(msg: string) {
    const n = document.createElement('div');
    n.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(34,197,94,.9);color:#fff;padding:12px 16px;border-radius:10px;z-index:10000;backdrop-filter:blur(10px);font-weight:600;border:1px solid rgba(255,255,255,.1)';
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2500);
  }
};

export default function NotificationSystem() {
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(() => { /* mount hook if needed */ }, []);
  return <div ref={ref} style={{ display:'none' }} />;
}

