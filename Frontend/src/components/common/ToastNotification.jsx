import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, CircleX, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_META = {
  success: { icon: CheckCircle2, classes: 'border-[#16A34A]/40 bg-[#16A34A]/15 text-[#DCFCE7]' },
  error: { icon: CircleX, classes: 'border-[#DC2626]/40 bg-[#DC2626]/15 text-[#FEE2E2]' },
  warning: { icon: CircleAlert, classes: 'border-[#D97706]/40 bg-[#D97706]/15 text-[#FEF3C7]' },
  info: { icon: Info, classes: 'border-[#1A73E8]/40 bg-[#1A73E8]/15 text-[#DBEAFE]' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const value = useMemo(() => ({ toast: pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const meta = TOAST_META[toast.type] || TOAST_META.info;
          const Icon = meta.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2 rounded-lg border p-3 shadow-lg backdrop-blur ${meta.classes}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 text-sm">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded p-0.5 hover:bg-black/20"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
