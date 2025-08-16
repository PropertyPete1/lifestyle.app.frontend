'use client';

import { useEffect } from 'react';

export default function Particles() {
  useEffect(() => {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    const count = 50;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'particle';
      d.style.left = Math.random() * 100 + '%';
      d.style.animationDelay = Math.random() * 20 + 's';
      d.style.animationDuration = (Math.random() * 10 + 15) + 's';
      container.appendChild(d);
    }
  }, []);
  return null;
}


