import { describe, it, expect } from 'vitest';
import {
  findNode,
  findParentNode,
  collectAllIds,
  filterTree,
  isDescendant,
  flattenTree,
  findPath,
} from './tree';
import { MenuTreeNode } from '../types/menu';

describe('tree utility', () => {
  const sampleTree: MenuTreeNode[] = [
    {
      id: 'root-1',
      name: 'System Management',
      parentId: null,
      depth: 0,
      position: 0,
      children: [
        {
          id: 'child-1-1',
          name: 'Systems',
          parentId: 'root-1',
          depth: 1,
          position: 0,
          children: [
            {
              id: 'child-1-1-1',
              name: 'System Code',
              parentId: 'child-1-1',
              depth: 2,
              position: 0,
              children: [],
            },
            {
              id: 'child-1-1-2',
              name: 'Code Registration',
              parentId: 'child-1-1',
              depth: 2,
              position: 1,
              children: [],
            },
          ],
        },
        {
          id: 'child-1-2',
          name: 'User Management',
          parentId: 'root-1',
          depth: 1,
          position: 1,
          children: [
            {
              id: 'child-1-2-1',
              name: 'API Users',
              parentId: 'child-1-2',
              depth: 2,
              position: 0,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 'root-2',
      name: 'Finance',
      parentId: null,
      depth: 0,
      position: 1,
      children: [],
    },
  ];

  describe('findNode', () => {
    it('finds a root node by ID', () => {
      const node = findNode(sampleTree, 'root-1');
      expect(node).not.toBeNull();
      expect(node?.name).toBe('System Management');
    });

    it('finds a deeply nested node by ID', () => {
      const node = findNode(sampleTree, 'child-1-1-1');
      expect(node).not.toBeNull();
      expect(node?.name).toBe('System Code');
    });

    it('returns null if node does not exist', () => {
      const node = findNode(sampleTree, 'non-existent-id');
      expect(node).toBeNull();
    });
  });

  describe('findParentNode', () => {
    it('returns null for root node', () => {
      const parent = findParentNode(sampleTree, 'root-1');
      expect(parent).toBeNull();
    });

    it('finds the parent of a direct child', () => {
      const parent = findParentNode(sampleTree, 'child-1-1');
      expect(parent?.id).toBe('root-1');
    });

    it('finds the parent of a deeply nested child', () => {
      const parent = findParentNode(sampleTree, 'child-1-1-1');
      expect(parent?.id).toBe('child-1-1');
    });

    it('returns null for missing child ID', () => {
      const parent = findParentNode(sampleTree, 'missing');
      expect(parent).toBeNull();
    });
  });

  describe('collectAllIds', () => {
    it('collects all node IDs in the hierarchy', () => {
      const ids = collectAllIds(sampleTree);
      expect(ids).toEqual([
        'root-1',
        'child-1-1',
        'child-1-1-1',
        'child-1-1-2',
        'child-1-2',
        'child-1-2-1',
        'root-2',
      ]);
    });

    it('returns empty array for empty tree', () => {
      expect(collectAllIds([])).toEqual([]);
    });
  });

  describe('filterTree', () => {
    it('returns original tree when query is empty', () => {
      const { filtered } = filterTree(sampleTree, '');
      expect(filtered).toHaveLength(2);
    });

    it('preserves ancestors when a deep leaf matches', () => {
      const { filtered, matchedIds, ancestorIds } = filterTree(
        sampleTree,
        'API Users',
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('root-1');
      expect(filtered[0].children[0].id).toBe('child-1-2');
      expect(filtered[0].children[0].children[0].id).toBe('child-1-2-1');

      expect(matchedIds.has('child-1-2-1')).toBe(true);
      expect(ancestorIds.has('root-1')).toBe(true);
      expect(ancestorIds.has('child-1-2')).toBe(true);
    });

    it('matches case-insensitively', () => {
      const { filtered } = filterTree(sampleTree, 'system code');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].children[0].children[0].name).toBe('System Code');
    });

    it('returns empty array when no nodes match', () => {
      const { filtered } = filterTree(sampleTree, 'completely unrelated query');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('isDescendant (Cycle detection)', () => {
    it('returns true when checking node against itself', () => {
      expect(isDescendant(sampleTree, 'root-1', 'root-1')).toBe(true);
      expect(isDescendant(sampleTree, 'child-1-1', 'child-1-1')).toBe(true);
    });

    it('returns true when checking parent against child', () => {
      expect(isDescendant(sampleTree, 'root-1', 'child-1-1')).toBe(true);
    });

    it('returns true when checking parent against deep descendant', () => {
      expect(isDescendant(sampleTree, 'root-1', 'child-1-1-1')).toBe(true);
      expect(isDescendant(sampleTree, 'child-1-1', 'child-1-1-1')).toBe(true);
    });

    it('returns false when checking child against parent', () => {
      expect(isDescendant(sampleTree, 'child-1-1-1', 'root-1')).toBe(false);
      expect(isDescendant(sampleTree, 'child-1-1', 'root-1')).toBe(false);
    });

    it('returns false for sibling or unrelated nodes', () => {
      expect(isDescendant(sampleTree, 'child-1-1', 'child-1-2')).toBe(false);
      expect(isDescendant(sampleTree, 'root-1', 'root-2')).toBe(false);
    });
  });

  describe('flattenTree', () => {
    it('flattens tree with correct depths', () => {
      const flat = flattenTree(sampleTree);
      expect(flat).toHaveLength(7);
      expect(flat.find((n) => n.id === 'root-1')?.depth).toBe(0);
      expect(flat.find((n) => n.id === 'child-1-1')?.depth).toBe(1);
      expect(flat.find((n) => n.id === 'child-1-1-1')?.depth).toBe(2);
    });
  });

  describe('findPath', () => {
    it('finds path of ancestor IDs to a target node', () => {
      const path = findPath(sampleTree, 'child-1-1-1');
      expect(path).toEqual(['root-1', 'child-1-1']);
    });

    it('returns empty path for root node', () => {
      const path = findPath(sampleTree, 'root-1');
      expect(path).toEqual([]);
    });

    it('returns null if node does not exist', () => {
      const path = findPath(sampleTree, 'non-existent');
      expect(path).toBeNull();
    });
  });
});
