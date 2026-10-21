'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuTreeNode as MenuTreeNodeType } from '@/types/menu';

interface MenuTreeNodeProps {
  node: MenuTreeNodeType;
  level: number;
  isLastChild: boolean;
  selectedId: string | null;
  expandedIds: Set<string>;
  searchQuery: string;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export const MenuTreeNode = memo(function MenuTreeNode({
  node,
  level,
  selectedId,
  expandedIds,
  searchQuery,
  onSelect,
  onToggleExpand,
  onAddChild,
  onDelete,
}: MenuTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: node.id,
    data: {
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      level,
    },
  });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  // Search text highlighting
  const renderHighlightedName = (name: string, query: string) => {
    if (!query.trim()) return name;
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = name.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === query.trim().toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-200 text-gray-900 rounded-xs px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      className="relative select-none"
    >
      {/* Node row */}
      <div
        className={`group flex items-center py-2 px-1 rounded-xl transition-all cursor-pointer relative ${
          isSelected
            ? 'bg-blue-50/70 text-stk-primary font-semibold'
            : 'hover:bg-gray-50 text-stk-textMain'
        } ${isOver && !isDragging ? 'ring-2 ring-stk-primary bg-blue-50/30' : ''}`}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(node.id);
          }
        }}
        tabIndex={0}
      >
        {/* Drag Handle: visible on hover or mobile, does not interfere with clicks */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="Drag to reorder or move"
          aria-label={`Drag ${node.name}`}
          className="p-1 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 touch-none shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Expand / Collapse Chevron */}
        <div className="w-5 h-5 flex items-center justify-center mr-1 shrink-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 rounded hover:bg-gray-200/60 text-gray-500 hover:text-gray-800 transition"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Node Name */}
        <span className="text-sm tracking-tight truncate max-w-xs md:max-w-md">
          {renderHighlightedName(node.name, searchQuery)}
        </span>

        {/* Action Buttons: Blue (+) button and Delete trash */}
        <div
          className={`ml-2 flex items-center gap-1.5 transition-opacity ${
            isSelected
              ? 'opacity-100'
              : 'opacity-70 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100'
          }`}
        >
          {/* Circular Blue (+) button matching Figma */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            title="Add sub-menu"
            aria-label={`Add child to ${node.name}`}
            className="w-6 h-6 rounded-full bg-stk-primary hover:bg-stk-primaryHover text-white flex items-center justify-center shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Delete trash button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id, node.name);
            }}
            title="Delete menu"
            aria-label={`Delete ${node.name}`}
            className="w-6 h-6 rounded-full hover:bg-rose-100 text-gray-400 hover:text-rose-600 flex items-center justify-center transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Children container with Figma-matching connector lines */}
      {hasChildren && isExpanded && (
        <div className="relative ml-4 pl-4 border-l border-stk-connector">
          {node.children.map((child, idx) => (
            <div key={child.id} className="relative">
              {/* Horizontal line connector tick */}
              <div
                className={`absolute -left-4 top-4 w-4 border-t border-stk-connector ${
                  idx === node.children.length - 1 ? 'rounded-bl' : ''
                }`}
              />

              {/* Cover remaining border if last child to form clean 'L' elbow */}
              {idx === node.children.length - 1 && (
                <div className="absolute -left-[17px] top-4 bottom-0 w-1 bg-white" />
              )}

              <MenuTreeNode
                node={child}
                level={level + 1}
                isLastChild={idx === node.children.length - 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                searchQuery={searchQuery}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                onAddChild={onAddChild}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
