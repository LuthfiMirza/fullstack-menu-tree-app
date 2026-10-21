'use client';

import React, { useEffect, useState } from 'react';
import { useMenuStore } from '@/store/menu.store';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function MenuDetailForm() {
  const selectedMenu = useMenuStore((state) => state.selectedMenu);
  const formMode = useMenuStore((state) => state.formMode);
  const createParentId = useMenuStore((state) => state.createParentId);
  const createParentName = useMenuStore((state) => state.createParentName);
  const isMutating = useMenuStore((state) => state.isMutating);

  const createMenu = useMenuStore((state) => state.createMenu);
  const updateMenu = useMenuStore((state) => state.updateMenu);
  const deleteMenu = useMenuStore((state) => state.deleteMenu);
  const cancelCreate = useMenuStore((state) => state.cancelCreate);

  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync name input with selected menu or reset on create mode
  useEffect(() => {
    if (formMode === 'create') {
      setName('');
      setValidationError(null);
    } else if (selectedMenu) {
      setName(selectedMenu.name);
      setValidationError(null);
    }
  }, [formMode, selectedMenu]);

  // Derive form values
  const isCreate = formMode === 'create';
  const menuIdDisplay = isCreate
    ? 'Generated after save'
    : selectedMenu?.id || '—';

  const depthDisplay = isCreate
    ? createParentId
      ? (selectedMenu?.depth ?? 0) + 1
      : 0
    : selectedMenu?.depth ?? 0;

  const parentDataDisplay = isCreate
    ? createParentName || '—'
    : selectedMenu?.parentName || '—';

  // Check if save is valid and enabled
  const trimmedName = name.trim();
  const isNameChanged = isCreate ? trimmedName.length > 0 : trimmedName !== selectedMenu?.name;
  const isSaveDisabled = isMutating || !isNameChanged || trimmedName.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedName) {
      setValidationError('Menu name must not be empty');
      return;
    }
    if (trimmedName.length > 100) {
      setValidationError('Menu name must be at most 100 characters');
      return;
    }

    setValidationError(null);

    if (isCreate) {
      await createMenu(trimmedName);
    } else {
      await updateMenu(trimmedName);
    }
  };

  const handleDelete = async () => {
    if (!selectedMenu) return;
    await deleteMenu(selectedMenu.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Form header if in create mode */}
        {isCreate && (
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stk-primary">
              Creating {createParentId ? 'Sub-Menu' : 'Root Menu'}
            </span>
            <button
              type="button"
              onClick={cancelCreate}
              className="text-xs text-gray-500 hover:text-gray-800 underline transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* 1. Menu ID */}
        <div>
          <label className="block text-sm font-medium text-stk-textSub mb-1.5">
            Menu ID
          </label>
          <input
            type="text"
            readOnly
            value={menuIdDisplay}
            className="w-full px-4 py-3 bg-stk-inputBg border border-transparent rounded-field text-sm text-gray-500 cursor-not-allowed select-all focus:outline-hidden"
          />
        </div>

        {/* 2. Depth */}
        <div className="max-w-[200px]">
          <label className="block text-sm font-medium text-stk-textSub mb-1.5">
            Depth
          </label>
          <input
            type="text"
            readOnly
            value={depthDisplay}
            className="w-full px-4 py-3 bg-stk-inputDisabled border border-transparent rounded-field text-sm font-semibold text-gray-700 cursor-not-allowed focus:outline-hidden"
          />
        </div>

        {/* 3. Parent Data */}
        <div>
          <label className="block text-sm font-medium text-stk-textSub mb-1.5">
            Parent Data
          </label>
          <input
            type="text"
            readOnly
            value={parentDataDisplay}
            className="w-full px-4 py-3 bg-stk-inputBg border border-transparent rounded-field text-sm text-gray-700 cursor-not-allowed focus:outline-hidden"
          />
        </div>

        {/* 4. Name */}
        <div>
          <label className="block text-sm font-medium text-stk-textSub mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Enter menu name"
            className={`w-full px-4 py-3 bg-stk-inputBg border rounded-field text-sm text-gray-900 focus:outline-hidden focus:bg-white transition ${
              validationError
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-transparent focus:border-stk-primary'
            }`}
          />
          {validationError && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {validationError}
            </p>
          )}
        </div>

        {/* Action Buttons matching Figma */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaveDisabled}
            className="w-48 py-3 bg-stk-primary hover:bg-stk-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-pill shadow-xs transition active:scale-95 flex items-center justify-center gap-2"
          >
            {isMutating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isCreate ? 'Create Menu' : 'Save'}
          </button>

          {!isCreate && selectedMenu && (
            <button
              type="button"
              disabled={isMutating}
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-5 py-3 border border-gray-200 text-rose-600 hover:bg-rose-50 rounded-pill text-sm font-medium transition active:scale-95 disabled:opacity-50"
            >
              Delete
            </button>
          )}

          {isCreate && (
            <button
              type="button"
              onClick={cancelCreate}
              className="px-4 py-3 text-sm text-gray-500 hover:text-gray-800 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Menu?"
        description={`Are you sure you want to delete "${selectedMenu?.name}"? All nested sub-menus and descendants will be deleted.`}
        confirmLabel="Delete"
        isLoading={isMutating}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
