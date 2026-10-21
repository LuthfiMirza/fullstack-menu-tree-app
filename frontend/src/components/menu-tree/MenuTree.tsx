'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMenuStore } from '@/store/menu.store';
import { filterTree } from '@/lib/tree';
import { MenuTreeNode } from './MenuTreeNode';
import { TreeToolbar } from './TreeToolbar';
import { SearchBox } from './SearchBox';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

export function MenuTree() {
  const tree = useMenuStore((state) => state.tree);
  const activeRootId = useMenuStore((state) => state.activeRootId);
  const selectedId = useMenuStore((state) => state.selectedId);
  const expandedIds = useMenuStore((state) => state.expandedIds);
  const searchQuery = useMenuStore((state) => state.searchQuery);
  const isMutating = useMenuStore((state) => state.isMutating);

  const setActiveRoot = useMenuStore((state) => state.setActiveRoot);
  const selectMenu = useMenuStore((state) => state.selectMenu);
  const toggleExpand = useMenuStore((state) => state.toggleExpand);
  const setExpandedIds = useMenuStore((state) => state.setExpandedIds);
  const startCreate = useMenuStore((state) => state.startCreate);
  const deleteMenu = useMenuStore((state) => state.deleteMenu);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Active root node
  const activeRootNode = useMemo(() => {
    if (!activeRootId) return tree[0] || null;
    return tree.find((r) => r.id === activeRootId) || null;
  }, [tree, activeRootId]);

  // Auto-expand ancestors when search query matches
  useEffect(() => {
    if (!searchQuery.trim() || !activeRootNode) return;
    const { ancestorIds } = filterTree([activeRootNode], searchQuery);
    if (ancestorIds.size > 0) {
      const currentExpanded = useMenuStore.getState().expandedIds;
      const merged = new Set(currentExpanded);
      ancestorIds.forEach((id) => merged.add(id));
      setExpandedIds(merged);
    }
  }, [searchQuery, activeRootNode, setExpandedIds]);

  // Filtered active root subtree based on search query
  const filteredTree = useMemo(() => {
    if (!activeRootNode) return [];
    if (!searchQuery.trim()) {
      return [activeRootNode];
    }
    const { filtered } = filterTree([activeRootNode], searchQuery);
    return filtered;
  }, [activeRootNode, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMenu(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (tree.length === 0) {
    return (
      <div className="w-full">
        <EmptyState
          title="No menus yet"
          description="Create your first root menu to get started."
          actionLabel="+ New root menu"
          onAction={() => startCreate(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* Root Menu Selector Dropdown */}
      <div className="mb-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Menu
        </label>
        <div className="relative max-w-sm">
          <select
            value={activeRootId || ''}
            onChange={(e) => {
              if (e.target.value === '__NEW_ROOT__') {
                startCreate(null);
              } else {
                setActiveRoot(e.target.value);
              }
            }}
            className="w-full appearance-none bg-stk-inputBg border border-gray-200/80 rounded-field px-4 py-3 text-sm font-medium text-gray-800 focus:outline-hidden focus:border-stk-primary focus:bg-white transition cursor-pointer shadow-2xs pr-10"
          >
            {tree.map((root) => (
              <option key={root.id} value={root.id}>
                {root.name}
              </option>
            ))}
            <option value="__NEW_ROOT__">+ New root menu</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <SearchBox />

      {/* Expand / Collapse Toolbar */}
      <TreeToolbar />

      {/* Tree items */}
      <div
        role="tree"
        aria-label="Menu hierarchy"
        className="mt-2 py-2 pr-4 overflow-x-auto min-h-[300px]"
      >
        {filteredTree.length > 0 ? (
          filteredTree.map((rootNode) => (
            <MenuTreeNode
              key={rootNode.id}
              node={rootNode}
              level={0}
              isLastChild={true}
              selectedId={selectedId}
              expandedIds={expandedIds}
              searchQuery={searchQuery}
              onSelect={selectMenu}
              onToggleExpand={toggleExpand}
              onAddChild={(parentId) => startCreate(parentId)}
              onDelete={(id, name) => setDeleteTarget({ id, name })}
            />
          ))
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No menus matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Menu?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All nested sub-menus and descendants will be permanently removed.`}
        confirmLabel="Delete permanently"
        isLoading={isMutating}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
