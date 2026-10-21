'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MenuTree } from '../menu-tree/MenuTree';
import { MenuDetailForm } from '../menu-form/MenuDetailForm';
import { ToastContainer } from '../ui/Toast';
import { Spinner } from '../ui/Spinner';
import { ErrorState } from '../ui/ErrorState';
import { useMenuStore } from '@/store/menu.store';

export function AppShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const status = useMenuStore((state) => state.status);
  const error = useMenuStore((state) => state.error);
  const fetchTree = useMenuStore((state) => state.fetchTree);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return (
    <div className="min-h-screen bg-white text-stk-textMain flex flex-col md:flex-row antialiased">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <Spinner className="w-10 h-10 text-stk-primary" />
            <p className="text-sm text-gray-500 font-medium">
              Loading menu system...
            </p>
          </div>
        )}

        {/* Error State with Retry */}
        {status === 'error' && (
          <div className="max-w-md mx-auto my-12">
            <ErrorState
              message={error || 'Failed to connect to backend service'}
              onRetry={() => fetchTree()}
            />
          </div>
        )}

        {/* Content Ready: 2-column Desktop, Stacked Mobile */}
        {status !== 'loading' && status !== 'error' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 items-start">
            {/* Left Column: Tree */}
            <div className="lg:col-span-7 xl:col-span-6">
              <MenuTree />
            </div>

            {/* Right Column: Detail Form */}
            <div className="lg:col-span-5 xl:col-span-6 pt-2 lg:sticky lg:top-8">
              <div className="bg-transparent rounded-2xl">
                <MenuDetailForm />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}
