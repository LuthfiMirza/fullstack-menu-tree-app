'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useMenuStore } from '@/store/menu.store';

export function SearchBox() {
  const searchQuery = useMenuStore((state) => state.searchQuery);
  const setSearchQuery = useMenuStore((state) => state.setSearchQuery);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 250);

    return () => clearTimeout(handler);
  }, [localQuery, setSearchQuery]);

  return (
    <div className="relative w-full max-w-md my-2.5">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="Search menu items..."
        className="w-full h-11 pl-10 pr-9 text-sm bg-stk-inputBg text-gray-900 placeholder:text-gray-400 rounded-field border border-gray-200/80 shadow-2xs focus:border-stk-primary focus:bg-white focus:outline-hidden transition"
      />
      {localQuery ? (
        <button
          type="button"
          onClick={() => {
            setLocalQuery('');
            setSearchQuery('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
}
