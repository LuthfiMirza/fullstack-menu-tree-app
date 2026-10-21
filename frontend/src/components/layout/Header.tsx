'use client';

import React from 'react';
import { Folder, LayoutGrid, Menu as MenuIcon } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  return (
    <header className="mb-6 pt-2">
      {/* Mobile top navigation bar */}
      <div className="flex items-center justify-between md:hidden mb-4 pb-2 border-b border-gray-100">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          STK Menu Tree
        </span>
        <div className="w-6" />
      </div>

      {/* Breadcrumb matching Figma */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-stk-textSub mb-4"
      >
        <Folder className="w-4 h-4 text-gray-400" />
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">Menus</span>
      </nav>

      {/* Title with circular blue badge icon */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-stk-primary text-white flex items-center justify-center shadow-sm shrink-0">
          <LayoutGrid className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-stk-textMain">
          Menus
        </h1>
      </div>
    </header>
  );
}
