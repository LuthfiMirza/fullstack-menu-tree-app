import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';
import { MenusService } from './menus.service';
import { Menu } from './menu.entity';

describe('MenusService', () => {
  let service: MenusService;
  let inMemoryMenus: Menu[] = [];

  // Helper to create mock EntityManager & Repository backed by inMemoryMenus
  function createMockEntityManager(): EntityManager {
    return {
      find: jest.fn(
        async (_entityClass: unknown, options?: FindManyOptions<Menu>) => {
          let results = [...inMemoryMenus];
          if (options?.where) {
            const where = options.where as Record<string, unknown>;
            if (where.parentId !== undefined) {
              const expectedParent =
                where.parentId === null ||
                (typeof where.parentId === 'object' &&
                  where.parentId !== null &&
                  (where.parentId as Record<string, unknown>)._type ===
                    'isNull')
                  ? null
                  : where.parentId;
              results = results.filter((m) => m.parentId === expectedParent);
            }
            if (where.id !== undefined) {
              results = results.filter((m) => m.id === where.id);
            }
          }
          const order = options?.order as Record<string, unknown> | undefined;
          if (order?.position === 'DESC') {
            results.sort((a, b) => b.position - a.position);
          } else {
            results.sort((a, b) => a.position - b.position);
          }
          if (options?.take) {
            results = results.slice(0, options.take);
          }
          return results;
        },
      ),

      findOne: jest.fn(
        async (_entityClass: unknown, options?: FindOneOptions<Menu>) => {
          const where = options?.where as Record<string, unknown> | undefined;
          if (where?.id) {
            return inMemoryMenus.find((m) => m.id === where.id) || null;
          }
          return null;
        },
      ),

      create: jest.fn((_entityClass: unknown, dto: Partial<Menu>) => {
        const now = new Date();
        return {
          id: dto.id || `uuid-${Math.random().toString(36).substring(2, 9)}`,
          name: dto.name || '',
          parentId: dto.parentId ?? null,
          position: dto.position ?? 0,
          createdAt: now,
          updatedAt: now,
        } as Menu;
      }),

      save: jest.fn(async (_entityClassOrEntity: unknown, entity?: Menu) => {
        const target = (entity || _entityClassOrEntity) as Menu;
        const index = inMemoryMenus.findIndex((m) => m.id === target.id);
        if (index >= 0) {
          inMemoryMenus[index] = { ...inMemoryMenus[index], ...target };
          return inMemoryMenus[index];
        } else {
          inMemoryMenus.push(target);
          return target;
        }
      }),

      delete: jest.fn(async (_entityClass: unknown, id: string) => {
        // Cascade delete simulating postgres ON DELETE CASCADE
        function removeWithDescendants(deleteId: string) {
          const children = inMemoryMenus.filter((m) => m.parentId === deleteId);
          for (const child of children) {
            removeWithDescendants(child.id);
          }
          inMemoryMenus = inMemoryMenus.filter((m) => m.id !== deleteId);
        }
        removeWithDescendants(id);
      }),

      getRepository: jest.fn(() => ({
        findOne: jest.fn(async (options?: FindOneOptions<Menu>) => {
          const where = options?.where as Record<string, unknown> | undefined;
          if (where?.id) {
            return inMemoryMenus.find((m) => m.id === where.id) || null;
          }
          return null;
        }),
      })),
    } as unknown as EntityManager;
  }

  const mockEntityManager = createMockEntityManager();

  const mockRepository = {
    find: jest.fn(async (options?: FindManyOptions<Menu>) => {
      const results = [...inMemoryMenus];
      const order = options?.order as Record<string, unknown> | undefined;
      if (order?.position === 'ASC') {
        results.sort((a, b) => a.position - b.position);
      }
      return results;
    }),
    findOne: jest.fn(async (options?: FindOneOptions<Menu>) => {
      const where = options?.where as Record<string, unknown> | undefined;
      if (where?.id) {
        return inMemoryMenus.find((m) => m.id === where.id) || null;
      }
      return null;
    }),
    save: jest.fn(async (entity: Menu) => {
      const index = inMemoryMenus.findIndex((m) => m.id === entity.id);
      if (index >= 0) {
        inMemoryMenus[index] = { ...inMemoryMenus[index], ...entity };
        return inMemoryMenus[index];
      } else {
        inMemoryMenus.push(entity);
        return entity;
      }
    }),
  };

  const mockDataSource = {
    transaction: jest.fn(
      async <T>(runInTransaction: (manager: EntityManager) => Promise<T>) => {
        return runInTransaction(mockEntityManager);
      },
    ),
  };

  beforeEach(async () => {
    inMemoryMenus = [];
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusService,
        {
          provide: getRepositoryToken(Menu),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
  });

  describe('getTree', () => {
    it('returns empty array when database is empty', async () => {
      const tree = await service.getTree();
      expect(tree).toEqual([]);
    });

    it('returns full tree sorted by sibling position', async () => {
      const now = new Date();
      inMemoryMenus = [
        {
          id: '1',
          name: 'Root',
          parentId: null,
          position: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '2',
          name: 'Child 2',
          parentId: '1',
          position: 1,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '3',
          name: 'Child 1',
          parentId: '1',
          position: 0,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const tree = await service.getTree();
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('1');
      expect(tree[0].children.map((c) => c.name)).toEqual([
        'Child 1',
        'Child 2',
      ]);
    });
  });

  describe('findOne', () => {
    it('returns menu with derived depth and parentName', async () => {
      const now = new Date();
      inMemoryMenus = [
        {
          id: 'p1',
          name: 'Parent',
          parentId: null,
          position: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'c1',
          name: 'Child',
          parentId: 'p1',
          position: 0,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const res = await service.findOne('c1');
      expect(res.id).toBe('c1');
      expect(res.name).toBe('Child');
      expect(res.parentName).toBe('Parent');
      expect(res.depth).toBe(1);
    });

    it('throws 404 when menu is not found', async () => {
      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a root menu at position 0 when first, position 1 when second', async () => {
      const first = await service.create({ name: 'Root 1' });
      expect(first.name).toBe('Root 1');
      expect(first.parentId).toBeNull();
      expect(first.position).toBe(0);
      expect(first.depth).toBe(0);

      const second = await service.create({ name: 'Root 2' });
      expect(second.name).toBe('Root 2');
      expect(second.position).toBe(1);
      expect(second.depth).toBe(0);
    });

    it('creates a child menu under valid parent with incremented position', async () => {
      const root = await service.create({ name: 'Root' });
      const child1 = await service.create({
        name: 'Child 1',
        parentId: root.id,
      });
      expect(child1.parentId).toBe(root.id);
      expect(child1.parentName).toBe('Root');
      expect(child1.position).toBe(0);
      expect(child1.depth).toBe(1);

      const child2 = await service.create({
        name: 'Child 2',
        parentId: root.id,
      });
      expect(child2.position).toBe(1);
      expect(child2.depth).toBe(1);
    });

    it('throws 404 when parentId does not exist', async () => {
      await expect(
        service.create({ name: 'Child', parentId: 'non-existent-id' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 400 when name is empty or whitespace', async () => {
      await expect(service.create({ name: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('updates menu name successfully', async () => {
      const root = await service.create({ name: 'Original Name' });
      const updated = await service.update(root.id, { name: 'Renamed Node' });
      expect(updated.id).toBe(root.id);
      expect(updated.name).toBe('Renamed Node');
    });

    it('throws 404 when updating non-existent menu', async () => {
      await expect(
        service.update('non-existent-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 400 when name is whitespace only', async () => {
      const root = await service.create({ name: 'Valid' });
      await expect(service.update(root.id, { name: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('deletes menu and cascades to all its descendants, recompacting remaining siblings', async () => {
      const root = await service.create({ name: 'Root' });
      const c1 = await service.create({ name: 'Child 1', parentId: root.id });
      const c2 = await service.create({ name: 'Child 2', parentId: root.id });
      const c3 = await service.create({ name: 'Child 3', parentId: root.id });
      const gc1 = await service.create({
        name: 'Grandchild 1',
        parentId: c2.id,
      });

      // Delete Child 2 (c2)
      await service.delete(c2.id);

      // Verify c2 and gc1 are deleted
      expect(inMemoryMenus.find((m) => m.id === c2.id)).toBeUndefined();
      expect(inMemoryMenus.find((m) => m.id === gc1.id)).toBeUndefined();

      // Verify position compaction: Child 1 remains 0, Child 3 becomes 1
      const remainingChildren = inMemoryMenus
        .filter((m) => m.parentId === root.id)
        .sort((a, b) => a.position - b.position);

      expect(remainingChildren).toHaveLength(2);
      expect(remainingChildren[0].id).toBe(c1.id);
      expect(remainingChildren[0].position).toBe(0);
      expect(remainingChildren[1].id).toBe(c3.id);
      expect(remainingChildren[1].position).toBe(1);
    });

    it('throws 404 when deleting non-existent menu', async () => {
      await expect(service.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('move', () => {
    it('moves menu to a valid new parent and appends to end when position omitted', async () => {
      const r1 = await service.create({ name: 'Root 1' });
      const r2 = await service.create({ name: 'Root 2' });
      const c1 = await service.create({ name: 'Child 1', parentId: r1.id });
      await service.create({
        name: 'R2 Child 1',
        parentId: r2.id,
      });

      const moved = await service.move(c1.id, { parentId: r2.id });
      expect(moved.parentId).toBe(r2.id);
      expect(moved.parentName).toBe('Root 2');
      expect(moved.position).toBe(1); // appended after R2 Child 1
    });

    it('moves menu to root (parentId: null)', async () => {
      const r1 = await service.create({ name: 'Root 1' });
      const c1 = await service.create({ name: 'Child 1', parentId: r1.id });

      const moved = await service.move(c1.id, { parentId: null });
      expect(moved.parentId).toBeNull();
      expect(moved.parentName).toBeNull();
      expect(moved.depth).toBe(0);
    });

    it('throws 409 when moving menu into itself', async () => {
      const root = await service.create({ name: 'Root' });
      await expect(
        service.move(root.id, { parentId: root.id }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws 409 when moving menu into its own descendant', async () => {
      const r1 = await service.create({ name: 'Root 1' });
      const c1 = await service.create({ name: 'Child 1', parentId: r1.id });
      const gc1 = await service.create({
        name: 'Grandchild 1',
        parentId: c1.id,
      });

      // Attempt moving r1 into gc1
      await expect(service.move(r1.id, { parentId: gc1.id })).rejects.toThrow(
        ConflictException,
      );
    });

    it('returns existing node as no-op when moving to same parent with same position', async () => {
      const root = await service.create({ name: 'Root' });
      const c1 = await service.create({ name: 'Child 1', parentId: root.id });

      const result = await service.move(c1.id, {
        parentId: root.id,
        position: 0,
      });
      expect(result.id).toBe(c1.id);
      expect(result.position).toBe(0);
    });

    it('throws 404 when moving non-existent menu', async () => {
      await expect(
        service.move('non-existent-id', { parentId: null }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 404 when target parent does not exist', async () => {
      const root = await service.create({ name: 'Root' });
      await expect(
        service.move(root.id, { parentId: 'missing-parent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('reorders menu in range and shifts siblings correctly', async () => {
      const root = await service.create({ name: 'Root' });
      await service.create({ name: 'A', parentId: root.id });
      await service.create({ name: 'B', parentId: root.id });
      const c3 = await service.create({ name: 'C', parentId: root.id });

      // Move C from position 2 to position 0
      const reordered = await service.reorder(c3.id, { position: 0 });
      expect(reordered.position).toBe(0);

      const siblings = inMemoryMenus
        .filter((m) => m.parentId === root.id)
        .sort((a, b) => a.position - b.position);

      expect(siblings.map((s) => s.name)).toEqual(['C', 'A', 'B']);
      expect(siblings.map((s) => s.position)).toEqual([0, 1, 2]);
    });

    it('throws 400 when reorder position is out of range', async () => {
      const root = await service.create({ name: 'Root' });
      const c1 = await service.create({ name: 'A', parentId: root.id });

      await expect(service.reorder(c1.id, { position: 5 })).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.reorder(c1.id, { position: -1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws 404 when reordering non-existent menu', async () => {
      await expect(
        service.reorder('non-existent-id', { position: 0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns unchanged node when reorder position is same', async () => {
      const root = await service.create({ name: 'Root' });
      const c1 = await service.create({ name: 'A', parentId: root.id });

      const res = await service.reorder(c1.id, { position: 0 });
      expect(res.position).toBe(0);
    });
  });
});
