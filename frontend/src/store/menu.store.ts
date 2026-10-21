import { create } from 'zustand';
import { FormMode, MenuResponse, MenuTreeNode } from '../types/menu';
import { menuApi, ApiError } from '../lib/api';
import { collectAllIds, findNode, findParentNode } from '../lib/tree';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface MenuState {
  tree: MenuTreeNode[];
  activeRootId: string | null;
  selectedId: string | null;
  selectedMenu: MenuResponse | null;
  formMode: FormMode;
  createParentId: string | null;
  createParentName: string | null;
  expandedIds: Set<string>;
  searchQuery: string;
  status: 'idle' | 'loading' | 'error';
  isMutating: boolean;
  error: string | null;
  toasts: ToastMessage[];

  // Actions
  fetchTree: () => Promise<void>;
  setActiveRoot: (rootId: string) => void;
  selectMenu: (id: string | null) => Promise<void>;
  startCreate: (parentId?: string | null) => void;
  cancelCreate: () => void;
  toggleExpand: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setExpandedIds: (ids: Set<string>) => void;
  setSearchQuery: (query: string) => void;
  createMenu: (name: string) => Promise<boolean>;
  updateMenu: (name: string) => Promise<boolean>;
  deleteMenu: (id: string) => Promise<boolean>;
  moveMenu: (id: string, parentId: string | null, position?: number) => Promise<boolean>;
  reorderMenu: (id: string, position: number) => Promise<boolean>;
  addToast: (type: 'success' | 'error', message: string) => void;
  removeToast: (id: string) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  tree: [],
  activeRootId: null,
  selectedId: null,
  selectedMenu: null,
  formMode: 'edit',
  createParentId: null,
  createParentName: null,
  expandedIds: new Set<string>(),
  searchQuery: '',
  status: 'idle',
  isMutating: false,
  error: null,
  toasts: [],

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  fetchTree: async () => {
    set({ status: 'loading', error: null });
    try {
      const tree = await menuApi.getTree();
      const currentActiveRootId = get().activeRootId;
      const validActiveRootId =
        tree.length > 0
          ? tree.find((r) => r.id === currentActiveRootId)
            ? currentActiveRootId
            : tree[0].id
          : null;

      // Expand all nodes on initial load for optimal UX matching Figma
      const allIds = new Set(collectAllIds(tree));

      set({
        tree,
        activeRootId: validActiveRootId,
        expandedIds: allIds,
        status: 'idle',
      });

      // Auto-select "System Code" if present (to match Figma), else first root
      const state = get();
      if (!state.selectedId && tree.length > 0) {
        const systemCodeNode = findNode(tree, '56320ee9-6af6-11ed-a7ba-f220afe5e4a9');
        if (systemCodeNode) {
          get().selectMenu(systemCodeNode.id);
        } else if (validActiveRootId) {
          get().selectMenu(validActiveRootId);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to fetch menu tree';
      set({ status: 'error', error: message });
      get().addToast('error', message);
    }
  },

  setActiveRoot: (rootId: string) => {
    const { tree } = get();
    const chosenRoot = tree.find((r) => r.id === rootId);
    if (!chosenRoot) return;

    const subtreeIds = new Set(collectAllIds([chosenRoot]));
    set({
      activeRootId: rootId,
      selectedId: rootId,
      formMode: 'edit',
      createParentId: null,
      createParentName: null,
      searchQuery: '',
      expandedIds: subtreeIds,
    });
    get().selectMenu(rootId);
  },

  selectMenu: async (id: string | null) => {
    if (!id) {
      set({ selectedId: null, selectedMenu: null, formMode: 'edit' });
      return;
    }

    set({ selectedId: id, formMode: 'edit', createParentId: null, createParentName: null });
    try {
      const menu = await menuApi.getMenu(id);
      set({ selectedMenu: menu });
    } catch (err: unknown) {
      // Fallback: build from tree if backend offline
      const node = findNode(get().tree, id);
      if (node) {
        const parent = findParentNode(get().tree, id);
        set({
          selectedMenu: {
            id: node.id,
            name: node.name,
            parentId: node.parentId,
            parentName: parent?.name ?? null,
            depth: node.depth,
            position: node.position,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }
  },

  startCreate: (parentId?: string | null) => {
    const { tree, selectedMenu } = get();
    let pId: string | null = null;
    let pName: string | null = null;

    if (parentId !== undefined) {
      pId = parentId;
      if (parentId) {
        const parentNode = findNode(tree, parentId);
        pName = parentNode?.name ?? null;
      }
    } else if (selectedMenu) {
      pId = selectedMenu.id;
      pName = selectedMenu.name;
    }

    set({
      formMode: 'create',
      createParentId: pId,
      createParentName: pName,
    });
  },

  cancelCreate: () => {
    set({
      formMode: 'edit',
      createParentId: null,
      createParentName: null,
    });
  },

  toggleExpand: (id: string) => {
    set((state) => {
      const next = new Set(state.expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedIds: next };
    });
  },

  expandAll: () => {
    const { tree, activeRootId } = get();
    const activeRoot = tree.find((r) => r.id === activeRootId);
    if (!activeRoot) return;
    const allIds = collectAllIds([activeRoot]);
    set((state) => ({
      expandedIds: new Set([...state.expandedIds, ...allIds]),
    }));
  },

  collapseAll: () => {
    const { tree, activeRootId } = get();
    const activeRoot = tree.find((r) => r.id === activeRootId);
    if (!activeRoot) return;
    const subtreeIds = new Set(collectAllIds([activeRoot]));
    set((state) => {
      const next = new Set(state.expandedIds);
      for (const id of subtreeIds) {
        next.delete(id);
      }
      return { expandedIds: next };
    });
  },

  setExpandedIds: (ids: Set<string>) => {
    set({ expandedIds: ids });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  createMenu: async (name: string) => {
    const { createParentId } = get();
    set({ isMutating: true });
    try {
      const created = await menuApi.createMenu({
        name,
        parentId: createParentId,
      });

      get().addToast('success', `Menu "${created.name}" created successfully`);
      await get().fetchTree();

      // If created under a parent, ensure parent is expanded
      if (createParentId) {
        set((state) => ({
          expandedIds: new Set([...state.expandedIds, createParentId]),
        }));
      }

      // If created as root, set as active root
      if (!createParentId) {
        set({ activeRootId: created.id });
      }

      await get().selectMenu(created.id);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to create menu';
      get().addToast('error', msg);
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  updateMenu: async (name: string) => {
    const { selectedId } = get();
    if (!selectedId) return false;

    set({ isMutating: true });
    try {
      const updated = await menuApi.updateMenu(selectedId, { name });
      get().addToast('success', `Menu updated to "${updated.name}"`);
      await get().fetchTree();
      await get().selectMenu(selectedId);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update menu';
      get().addToast('error', msg);
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  deleteMenu: async (id: string) => {
    set({ isMutating: true });
    try {
      await menuApi.deleteMenu(id);
      get().addToast('success', 'Menu deleted successfully');

      const { activeRootId, tree } = get();
      await get().fetchTree();

      // If active root was deleted, select first available root
      const newTree = get().tree;
      if (id === activeRootId) {
        const nextRoot = newTree[0]?.id ?? null;
        set({ activeRootId: nextRoot });
        if (nextRoot) {
          get().selectMenu(nextRoot);
        } else {
          set({ selectedId: null, selectedMenu: null });
        }
      } else {
        // Select active root by default
        if (activeRootId) {
          get().selectMenu(activeRootId);
        }
      }
      return true;
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete menu';
      get().addToast('error', msg);
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  moveMenu: async (id: string, parentId: string | null, position?: number) => {
    const prevTree = get().tree;
    set({ isMutating: true });
    try {
      await menuApi.moveMenu(id, { parentId, position });
      get().addToast('success', 'Menu moved successfully');
      await get().fetchTree();
      if (parentId) {
        set((state) => ({
          expandedIds: new Set([...state.expandedIds, parentId]),
        }));
      }
      await get().selectMenu(id);
      return true;
    } catch (err: unknown) {
      set({ tree: prevTree });
      const msg = err instanceof ApiError ? err.message : 'Failed to move menu';
      get().addToast('error', msg);
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  reorderMenu: async (id: string, position: number) => {
    const prevTree = get().tree;

    // Helper to optimistically reorder siblings in memory
    function reorderInList(list: MenuTreeNode[]): MenuTreeNode[] {
      const idx = list.findIndex((m) => m.id === id);
      if (idx !== -1) {
        const item = list[idx];
        const nextList = list.filter((m) => m.id !== id);
        const targetPos = Math.max(0, Math.min(position, nextList.length));
        nextList.splice(targetPos, 0, item);
        return nextList.map((m, i) => ({ ...m, position: i }));
      }
      return list.map((m) => ({
        ...m,
        children: m.children ? reorderInList(m.children) : [],
      }));
    }

    const optimisticTree = reorderInList(prevTree);
    set({ tree: optimisticTree, isMutating: true });

    try {
      await menuApi.reorderMenu(id, { position });
      get().addToast('success', 'Menu reordered successfully');
      await get().fetchTree();
      await get().selectMenu(id);
      return true;
    } catch (err: unknown) {
      set({ tree: prevTree });
      const msg = err instanceof ApiError ? err.message : 'Failed to reorder menu';
      get().addToast('error', msg);
      return false;
    } finally {
      set({ isMutating: false });
    }
  },
}));
