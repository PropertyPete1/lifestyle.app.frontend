'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastItem = { id: string; message: string; type: 'success' | 'error' | 'info' };

type ToastContextValue = {
  show: (message: string, type?: ToastItem['type']) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: ToastItem = { id, message, type };
    setToasts(prev => [...prev, item]);
    // Auto-dismiss
    setTimeout(() => remove(id), 3200);
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id}
               onClick={() => remove(t.id)}
               style={{ cursor: 'pointer', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                        background: t.type === 'error' ? 'rgba(255, 60, 60, 0.15)' : t.type === 'success' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.08)',
                        color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: 360 }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


