import {
  buildTree,
  computeDepth,
  isDescendant,
  FlatMenuNode,
} from './menu-tree.util';

describe('menu-tree.util', () => {
  describe('buildTree', () => {
    it('returns empty array when given an empty list', () => {
      expect(buildTree([])).toEqual([]);
    });

    it('builds a tree from flat nested list with correct depth and hierarchy', () => {
      const items: FlatMenuNode[] = [
        { id: '1', name: 'Root', parentId: null, position: 0 },
        { id: '2', name: 'Child 1', parentId: '1', position: 0 },
        { id: '3', name: 'Child 2', parentId: '1', position: 1 },
        { id: '4', name: 'Grandchild 1', parentId: '2', position: 0 },
      ];

      const tree = buildTree(items);
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('1');
      expect(tree[0].depth).toBe(0);
      expect(tree[0].children).toHaveLength(2);

      expect(tree[0].children[0].id).toBe('2');
      expect(tree[0].children[0].depth).toBe(1);
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].id).toBe('4');
      expect(tree[0].children[0].children[0].depth).toBe(2);

      expect(tree[0].children[1].id).toBe('3');
      expect(tree[0].children[1].depth).toBe(1);
      expect(tree[0].children[1].children).toHaveLength(0);
    });

    it('handles unordered input correctly regardless of array ordering', () => {
      const items: FlatMenuNode[] = [
        { id: '4', name: 'Grandchild', parentId: '2', position: 0 },
        { id: '2', name: 'Child', parentId: '1', position: 0 },
        { id: '1', name: 'Root', parentId: null, position: 0 },
      ];

      const tree = buildTree(items);
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('1');
      expect(tree[0].depth).toBe(0);
      expect(tree[0].children[0].id).toBe('2');
      expect(tree[0].children[0].depth).toBe(1);
      expect(tree[0].children[0].children[0].id).toBe('4');
      expect(tree[0].children[0].children[0].depth).toBe(2);
    });

    it('sorts siblings by position ascending', () => {
      const items: FlatMenuNode[] = [
        { id: 'root', name: 'Root', parentId: null, position: 0 },
        { id: 'c3', name: 'Child 3', parentId: 'root', position: 2 },
        { id: 'c1', name: 'Child 1', parentId: 'root', position: 0 },
        { id: 'c2', name: 'Child 2', parentId: 'root', position: 1 },
      ];

      const tree = buildTree(items);
      const siblingIds = tree[0].children.map((c) => c.id);
      expect(siblingIds).toEqual(['c1', 'c2', 'c3']);
    });

    it('handles orphan nodes gracefully by promoting them to root', () => {
      const items: FlatMenuNode[] = [
        {
          id: 'orphan',
          name: 'Orphan',
          parentId: 'missing-parent',
          position: 0,
        },
        { id: 'root', name: 'Root', parentId: null, position: 1 },
      ];

      const tree = buildTree(items);
      expect(tree).toHaveLength(2);
      const rootIds = tree.map((n) => n.id);
      expect(rootIds).toContain('orphan');
      expect(rootIds).toContain('root');
      expect(tree.find((n) => n.id === 'orphan')?.depth).toBe(0);
    });
  });

  describe('isDescendant', () => {
    const parentMap: Record<string, string | null> = {
      root: null,
      nodeA: 'root',
      nodeB: 'nodeA',
      nodeC: 'nodeB',
      other: 'root',
    };

    const getParentId = (id: string) => parentMap[id] ?? null;

    it('returns true if target is candidate ancestor itself', () => {
      expect(isDescendant('nodeA', 'nodeA', getParentId)).toBe(true);
    });

    it('returns true if candidate ancestor is direct or indirect ancestor', () => {
      expect(isDescendant('nodeB', 'nodeA', getParentId)).toBe(true);
      expect(isDescendant('nodeC', 'root', getParentId)).toBe(true);
      expect(isDescendant('nodeC', 'nodeA', getParentId)).toBe(true);
    });

    it('returns false if candidate is not an ancestor', () => {
      expect(isDescendant('root', 'nodeA', getParentId)).toBe(false);
      expect(isDescendant('other', 'nodeA', getParentId)).toBe(false);
      expect(isDescendant('nodeA', 'nodeC', getParentId)).toBe(false);
    });

    it('handles cyclic parent relations without infinite loop', () => {
      const cyclicMap: Record<string, string> = {
        x: 'y',
        y: 'x',
      };
      expect(isDescendant('x', 'z', (id) => cyclicMap[id] ?? null)).toBe(false);
    });
  });

  describe('computeDepth', () => {
    const parentMap: Record<string, string | null> = {
      root: null,
      level1: 'root',
      level2: 'level1',
      level3: 'level2',
    };

    const getParentId = (id: string) => parentMap[id] ?? null;

    it('returns 0 for root', () => {
      expect(computeDepth('root', getParentId)).toBe(0);
    });

    it('returns correct depth for multi-level child', () => {
      expect(computeDepth('level1', getParentId)).toBe(1);
      expect(computeDepth('level2', getParentId)).toBe(2);
      expect(computeDepth('level3', getParentId)).toBe(3);
    });

    it('returns 0 for unknown id', () => {
      expect(computeDepth('unknown', getParentId)).toBe(0);
    });
  });
});
