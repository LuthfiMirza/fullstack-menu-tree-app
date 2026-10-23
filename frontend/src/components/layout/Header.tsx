'use client';

import React from 'react';
import { Folder, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps = {}) {
  return (
    <header className="mb-4 md:mb-6 pt-1 md:pt-2">

      {/* 2. Breadcrumb matching Figma */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-stk-textSub mb-4"
      >
        <Folder className="w-4 h-4 fill-[#D0D5DD] text-[#D0D5DD]" strokeWidth={1} />
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">Menus</span>
      </nav>

      {/* 3. Title with circular blue badge icon (Desktop/Tablet only: md:flex, hidden on mobile) */}
      <div className="hidden md:flex items-center gap-3.5">
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
