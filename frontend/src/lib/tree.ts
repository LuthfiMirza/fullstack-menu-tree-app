import { MenuTreeNode } from '../types/menu';

/**
 * Recursively finds a node by ID in the tree.
 */
export function findNode(
  nodes: MenuTreeNode[],
  id: string,
): MenuTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNode(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Finds the direct parent node of a given childId.
 */
export function findParentNode(
  nodes: MenuTreeNode[],
  childId: string,
  parent: MenuTreeNode | null = null,
): MenuTreeNode | null {
  for (const node of nodes) {
    if (node.id === childId) {
      return parent;
    }
    if (node.children && node.children.length > 0) {
      const found = findParentNode(node.children, childId, node);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Collects all node IDs from the given tree.
 */
export function collectAllIds(nodes: MenuTreeNode[]): string[] {
  const ids: string[] = [];
  function traverse(list: MenuTreeNode[]) {
    for (const node of list) {
      ids.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return ids;
}

/**
 * Filters the tree by search query.
 * Keeps ancestors of any matched node visible so the tree hierarchy remains valid.
 * Returns the filtered tree, matched IDs, and ancestor IDs to auto-expand.
 */
export function filterTree(
  nodes: MenuTreeNode[],
  query: string,
): {
  filtered: MenuTreeNode[];
  matchedIds: Set<string>;
  ancestorIds: Set<string>;
} {
  const cleanQuery = query.trim().toLowerCase();
  const matchedIds = new Set<string>();
  const ancestorIds = new Set<string>();

  if (!cleanQuery) {
    return {
      filtered: nodes,
      matchedIds,
      ancestorIds,
    };
  }

  function checkNode(node: MenuTreeNode): MenuTreeNode | null {
    const isDirectMatch = node.name.toLowerCase().includes(cleanQuery);
    if (isDirectMatch) {
      matchedIds.add(node.id);
    }

    const filteredChildren: MenuTreeNode[] = [];
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const matchingChild = checkNode(child);
        if (matchingChild) {
          filteredChildren.push(matchingChild);
        }
      }
    }

    if (isDirectMatch || filteredChildren.length > 0) {
      if (filteredChildren.length > 0) {
        ancestorIds.add(node.id);
      }
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  }

  const filtered: MenuTreeNode[] = [];
  for (const root of nodes) {
    const filteredRoot = checkNode(root);
    if (filteredRoot) {
      filtered.push(filteredRoot);
    }
  }

  return {
    filtered,
    matchedIds,
    ancestorIds,
  };
}

/**
 * Checks whether targetId is the parentId itself or a descendant of parentId.
 * Used for client-side cycle detection before drag-and-drop or move operations.
 */
export function isDescendant(
  nodes: MenuTreeNode[],
  parentId: string,
  targetId: string,
): boolean {
  if (parentId === targetId) return true;

  const parentNode = findNode(nodes, parentId);
  if (!parentNode || !parentNode.children) return false;

  function checkChildren(children: MenuTreeNode[]): boolean {
    for (const child of children) {
      if (child.id === targetId) return true;
      if (child.children && child.children.length > 0) {
        if (checkChildren(child.children)) return true;
      }
    }
    return false;
  }

  return checkChildren(parentNode.children);
}

/**
 * Flattens hierarchical tree into a single array with computed depth.
 */
export function flattenTree(
  nodes: MenuTreeNode[],
  depth = 0,
): Array<MenuTreeNode & { depth: number }> {
  const result: Array<MenuTreeNode & { depth: number }> = [];

  function traverse(list: MenuTreeNode[], currentDepth: number) {
    for (const item of list) {
      result.push({ ...item, depth: currentDepth });
      if (item.children && item.children.length > 0) {
        traverse(item.children, currentDepth + 1);
      }
    }
  }

  traverse(nodes, depth);
  return result;
}

/**
 * Finds the chain of ancestor IDs leading to targetId (excluding targetId itself).
 */
export function findPath(
  nodes: MenuTreeNode[],
  targetId: string,
  currentPath: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return currentPath;
    }
    if (node.children && node.children.length > 0) {
      const found = findPath(node.children, targetId, [...currentPath, node.id]);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
