import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Failed to load menu data',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-rose-200 rounded-3xl bg-rose-50/50">
      <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
      <p className="text-sm text-rose-600 mt-1 max-w-sm">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
      ) : null}
    </div>
  );
}
