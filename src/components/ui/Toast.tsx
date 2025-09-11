'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        px-6 py-4 rounded-lg shadow-lg
        flex items-center gap-3
        animate-slide-in-right
        transition-all duration-300
        hover:shadow-xl
        cursor-pointer
        max-w-sm
      `}
      onClick={() => onClose(toast.id)}
    >
      <span className="text-xl">{getIcon()}</span>
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(toast.id);
        }}
        className="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
}