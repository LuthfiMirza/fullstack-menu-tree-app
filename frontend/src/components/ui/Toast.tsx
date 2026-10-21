'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useMenuStore } from '@/store/menu.store';

export function ToastContainer() {
  const toasts = useMenuStore((state) => state.toasts);
  const removeToast = useMenuStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border transition-all transform duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md hover:bg-black/5 transition text-gray-400 hover:text-gray-700 ml-2"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
