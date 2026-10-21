'use client';

import React from 'react';
import Image from 'next/image';
import {
  Folder,
  LayoutGrid,
  Menu as MenuIcon,
  X,
  FolderTree,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  isMobileOpen,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const group1Items = [
    { label: 'Systems', icon: Folder, active: false },
    { label: 'System Code', icon: LayoutGrid, active: false },
    { label: 'Properties', icon: LayoutGrid, active: false },
    { label: 'Menus', icon: LayoutGrid, active: true },
    { label: 'API List', icon: LayoutGrid, active: false },
  ];

  const group2Items = [
    { label: 'Users & Group', icon: Folder },
    { label: 'Competition', icon: Folder },
  ];

  const sidebarContent = (
    <aside
      className={`h-full bg-stk-sidebar text-white rounded-sidebar transition-all duration-300 flex flex-col justify-between shadow-2xl p-4 overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Header / Logo */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2 py-3 mb-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-icon.svg"
                alt="Solusi Teknologi Kreatif Logo"
                width={36}
                height={36}
                className="w-9 h-9 shrink-0 drop-shadow-xs"
                priority
              />
              <div className="flex flex-col text-[13px] leading-[15px] font-bold text-white tracking-tight select-none">
                <span>Solusi</span>
                <span>Teknologi</span>
                <span>Kreatif</span>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition hidden md:block"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 mb-6">
            <Image
              src="/logo-icon.svg"
              alt="Solusi Teknologi Kreatif Logo"
              width={32}
              height={32}
              className="w-8 h-8 shrink-0 drop-shadow-xs"
              priority
            />
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition hidden md:block"
              aria-label="Expand sidebar"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Group 1: Enclosed in lighter-blue rounded panel */}
        <div className="bg-stk-sidebarGroup rounded-2xl p-2.5 flex flex-col gap-1.5">
          {group1Items.map((item) => {
            const Icon = item.icon;
            if (item.active) {
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-3.5 py-2.5 bg-stk-sidebarActive text-stk-primary font-bold rounded-xl shadow-sm transition cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </div>
              );
            }
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-white/90 hover:text-white hover:bg-white/10 font-medium rounded-xl transition cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0 opacity-80" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Group 2: Outside panel */}
        <div className="mt-4 px-2.5 flex flex-col gap-1.5">
          {group2Items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-white/85 hover:text-white hover:bg-white/10 font-medium rounded-xl transition cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0 opacity-80" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      {!isCollapsed && (
        <div className="px-3 py-2 text-xs text-white/40 border-t border-white/10">
          STK Admin System
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop floating sidebar */}
      <div className="hidden md:block h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4">
        {sidebarContent}
      </div>

      {/* Mobile drawer with backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 p-3 h-full max-w-[280px] w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
