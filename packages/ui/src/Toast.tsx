'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextValue {
  toast: (message: string, type?: ToastItem['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastItem['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
        role="region"
        aria-label="알림"
        style={{ maxWidth: '400px' }}
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  item: ToastItem;
}

function ToastItem({ item }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Enter animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const getIcon = () => {
    switch (item.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getColor = () => {
    switch (item.type) {
      case 'success':
        return '#22C55E';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#2563EB';
      default:
        return '#2563EB';
    }
  };

  return (
    <div
      role="alert"
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      className="rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${getColor()}`,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: getColor() }}
      >
        {getIcon()}
      </div>
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        {item.message}
      </p>
    </div>
  );
}
