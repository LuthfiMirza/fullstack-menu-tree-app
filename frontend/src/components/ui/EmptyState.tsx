import React from 'react';
import { FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No menus available',
  description = 'Get started by creating your first root menu.',
  actionLabel = 'Add first menu',
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
      <div className="p-4 bg-blue-50 text-stk-primary rounded-2xl mb-4 shadow-sm">
        <FolderPlus className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>
      {onAction ? (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2.5 text-sm font-semibold text-white bg-stk-primary rounded-full hover:bg-stk-primaryHover transition shadow-sm"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
