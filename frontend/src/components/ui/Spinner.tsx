import React from 'react';

export function Spinner({ className = 'w-6 h-6 text-stk-primary' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

export function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 py-2 animate-pulse">
      <div className="w-4 h-4 bg-gray-200 rounded" />
      <div className="h-5 bg-gray-200 rounded w-48" />
    </div>
  );
}
