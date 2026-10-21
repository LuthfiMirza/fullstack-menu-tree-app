'use client';

import React from 'react';
import { useMenuStore } from '@/store/menu.store';

export function TreeToolbar() {
  const expandAll = useMenuStore((state) => state.expandAll);
  const collapseAll = useMenuStore((state) => state.collapseAll);

  return (
    <div className="flex items-center gap-3 my-4">
      <button
        type="button"
        onClick={expandAll}
        className="px-6 py-2.5 bg-stk-darkBtn hover:bg-stk-darkBtnHover text-white text-sm font-semibold rounded-pill shadow-xs transition active:scale-95"
      >
        Expand All
      </button>
      <button
        type="button"
        onClick={collapseAll}
        className="px-6 py-2.5 bg-white hover:bg-gray-50 text-stk-textMain text-sm font-semibold rounded-pill border border-stk-border shadow-xs transition active:scale-95"
      >
        Collapse All
      </button>
    </div>
  );
}
