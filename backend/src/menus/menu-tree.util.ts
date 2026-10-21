import { MenuTreeNodeDto } from './dto/menu-response.dto';

export interface FlatMenuNode {
  id: string;
  name: string;
  parentId: string | null;
  position: number;
}

/**
 * Builds a hierarchy of MenuTreeNodeDto roots from a flat list of menu items.
 * O(n) construction using a Map, sorts siblings by position, and computes derived depth.
 */
export function buildTree(items: FlatMenuNode[]): MenuTreeNodeDto[] {
  if (!items || items.length === 0) {
    return [];
  }

  const nodeMap = new Map<string, MenuTreeNodeDto>();
  const roots: MenuTreeNodeDto[] = [];

  // Pass 1: Initialize all node objects with empty children
  for (const item of items) {
    nodeMap.set(item.id, {
      id: item.id,
      name: item.name,
      parentId: item.parentId,
      depth: 0,
      position: item.position ?? 0,
      children: [],
    });
  }

  // Pass 2: Connect children to parents, handle roots and orphans
  for (const item of items) {
    const node = nodeMap.get(item.id)!;
    if (item.parentId && nodeMap.has(item.parentId)) {
      const parentNode = nodeMap.get(item.parentId)!;
      parentNode.children.push(node);
    } else {
      // Node has no parent or parent is missing (orphan handling -> promoted to root)
      roots.push(node);
    }
  }

  // Pass 3: Sort children and assign depth recursively
  function finalizeTree(nodes: MenuTreeNodeDto[], currentDepth: number): void {
    nodes.sort((a, b) => a.position - b.position);
    for (const node of nodes) {
      node.depth = currentDepth;
      if (node.children.length > 0) {
        finalizeTree(node.children, currentDepth + 1);
      }
    }
  }

  finalizeTree(roots, 0);

  return roots;
}

/**
 * Checks if targetId is candidateAncestorId or a descendant of candidateAncestorId.
 * Used for cycle prevention during move operations.
 */
export function isDescendant(
  targetId: string,
  candidateAncestorId: string,
  getParentId: (id: string) => string | null | undefined,
): boolean {
  if (targetId === candidateAncestorId) {
    return true;
  }

  let currentId: string | null | undefined = targetId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      // Safeguard against pre-existing cycles
      break;
    }
    visited.add(currentId);

    const parentId = getParentId(currentId);
    if (!parentId) {
      break;
    }
    if (parentId === candidateAncestorId) {
      return true;
    }
    currentId = parentId;
  }

  return false;
}

/**
 * Computes depth of a node by walking up ancestor chain.
 * Root nodes have depth 0.
 */
export function computeDepth(
  id: string,
  getParentId: (id: string) => string | null | undefined,
): number {
  let depth = 0;
  let currentId: string | null | undefined = id;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      break;
    }
    visited.add(currentId);

    const parentId = getParentId(currentId);
    if (!parentId) {
      break;
    }
    depth++;
    currentId = parentId;
  }

  return depth;
}
