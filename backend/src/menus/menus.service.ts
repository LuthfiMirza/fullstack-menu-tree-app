import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MoveMenuDto } from './dto/move-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { MenuResponseDto, MenuTreeNodeDto } from './dto/menu-response.dto';
import { buildTree } from './menu-tree.util';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Returns complete hierarchy of menu trees in a single query.
   */
  async getTree(): Promise<MenuTreeNodeDto[]> {
    const menus = await this.menuRepository.find({
      order: { position: 'ASC' },
    });

    return buildTree(
      menus.map((m) => ({
        id: m.id,
        name: m.name,
        parentId: m.parentId,
        position: m.position,
      })),
    );
  }

  /**
   * Returns a single menu node with depth and parentName.
   */
  async findOne(id: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    return this.buildResponseDto(menu);
  }

  /**
   * Creates a new menu item and appends it to the end of siblings.
   */
  async create(createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    const trimmedName = createMenuDto.name?.trim();
    if (!trimmedName) {
      throw new BadRequestException('name must not be empty');
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      let parentName: string | null = null;

      if (createMenuDto.parentId) {
        const parent = await manager.findOne(Menu, {
          where: { id: createMenuDto.parentId },
        });
        if (!parent) {
          throw new NotFoundException(
            `Parent menu with ID "${createMenuDto.parentId}" not found`,
          );
        }
        parentName = parent.name;
      }

      // Calculate new position: (max sibling position) + 1 or 0
      const siblings = await manager.find(Menu, {
        where: {
          parentId: createMenuDto.parentId ? createMenuDto.parentId : IsNull(),
        },
        order: { position: 'DESC' },
        take: 1,
      });

      const nextPosition = siblings.length > 0 ? siblings[0].position + 1 : 0;

      const newMenu = manager.create(Menu, {
        name: trimmedName,
        parentId: createMenuDto.parentId || null,
        position: nextPosition,
      });

      const saved = await manager.save(Menu, newMenu);
      const depth = await this.calculateDepth(saved.id, manager);

      return {
        id: saved.id,
        name: saved.name,
        parentId: saved.parentId,
        parentName,
        depth,
        position: saved.position,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Updates only the name of an existing menu item.
   */
  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    const trimmedName = updateMenuDto.name?.trim();
    if (!trimmedName) {
      throw new BadRequestException('name must not be empty');
    }

    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    menu.name = trimmedName;
    const updated = await this.menuRepository.save(menu);

    return this.buildResponseDto(updated);
  }

  /**
   * Deletes a menu and cascades to all its descendants.
   * Compacts remaining siblings in a single transaction.
   */
  async delete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const menu = await manager.findOne(Menu, {
        where: { id },
      });

      if (!menu) {
        throw new NotFoundException(`Menu with ID "${id}" not found`);
      }

      const parentId = menu.parentId;

      // Delete the node (foreign key cascade deletes descendants)
      await manager.delete(Menu, id);

      // Compact remaining siblings
      const remainingSiblings = await manager.find(Menu, {
        where: { parentId: parentId ? parentId : IsNull() },
        order: { position: 'ASC' },
      });

      for (let i = 0; i < remainingSiblings.length; i++) {
        if (remainingSiblings[i].position !== i) {
          remainingSiblings[i].position = i;
          await manager.save(Menu, remainingSiblings[i]);
        }
      }
    });
  }

  /**
   * Moves a menu to a new parent and/or position with cycle prevention.
   */
  async move(id: string, moveMenuDto: MoveMenuDto): Promise<MenuResponseDto> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const menu = await manager.findOne(Menu, {
        where: { id },
      });

      if (!menu) {
        throw new NotFoundException(`Menu with ID "${id}" not found`);
      }

      const oldParentId = menu.parentId;
      const newParentId = moveMenuDto.parentId ?? null;
      const isSameParent = oldParentId === newParentId;

      // Cycle prevention: moving into self
      if (newParentId === id) {
        throw new ConflictException(
          'Cannot move a menu into itself or its own descendant',
        );
      }

      // Verify new parent exists if specified, and verify cycle down the tree
      if (newParentId !== null) {
        const newParent = await manager.findOne(Menu, {
          where: { id: newParentId },
        });

        if (!newParent) {
          throw new NotFoundException(
            `Target parent menu with ID "${newParentId}" not found`,
          );
        }

        // Walk up from target parent to check if menu.id is an ancestor
        let currentAncestorId: string | null = newParentId;
        const visited = new Set<string>();

        while (currentAncestorId) {
          if (currentAncestorId === id) {
            throw new ConflictException(
              'Cannot move a menu into itself or its own descendant',
            );
          }
          if (visited.has(currentAncestorId)) {
            break;
          }
          visited.add(currentAncestorId);

          const ancestor: Menu | null = await manager.findOne(Menu, {
            where: { id: currentAncestorId },
            select: ['id', 'parentId'],
          });
          currentAncestorId = ancestor ? ancestor.parentId : null;
        }
      }

      // If moving to same parent with same position (or position omitted), no-op
      if (
        isSameParent &&
        (moveMenuDto.position === undefined ||
          moveMenuDto.position === menu.position)
      ) {
        return this.buildResponseDto(menu, manager);
      }

      if (isSameParent) {
        // Reordering among same siblings
        const siblings = await manager.find(Menu, {
          where: { parentId: oldParentId ? oldParentId : IsNull() },
          order: { position: 'ASC' },
        });

        const targetPos = moveMenuDto.position ?? siblings.length - 1;
        if (targetPos < 0 || targetPos >= siblings.length) {
          throw new BadRequestException('Target position is out of range');
        }

        const filtered = siblings.filter((s) => s.id !== id);
        filtered.splice(targetPos, 0, menu);

        for (let i = 0; i < filtered.length; i++) {
          if (filtered[i].position !== i) {
            filtered[i].position = i;
            await manager.save(Menu, filtered[i]);
          }
        }
      } else {
        // Moving to a different parent

        // 1. Recompact old siblings
        const oldSiblings = await manager.find(Menu, {
          where: { parentId: oldParentId ? oldParentId : IsNull() },
          order: { position: 'ASC' },
        });

        const remainingOldSiblings = oldSiblings.filter((s) => s.id !== id);
        for (let i = 0; i < remainingOldSiblings.length; i++) {
          if (remainingOldSiblings[i].position !== i) {
            remainingOldSiblings[i].position = i;
            await manager.save(Menu, remainingOldSiblings[i]);
          }
        }

        // 2. Insert into new siblings
        const newSiblings = await manager.find(Menu, {
          where: { parentId: newParentId ? newParentId : IsNull() },
          order: { position: 'ASC' },
        });

        const targetPos =
          moveMenuDto.position !== undefined
            ? moveMenuDto.position
            : newSiblings.length;

        if (targetPos < 0 || targetPos > newSiblings.length) {
          throw new BadRequestException('Target position is out of range');
        }

        menu.parentId = newParentId;
        newSiblings.splice(targetPos, 0, menu);

        for (let i = 0; i < newSiblings.length; i++) {
          newSiblings[i].position = i;
          await manager.save(Menu, newSiblings[i]);
        }
      }

      return this.buildResponseDto(menu, manager);
    });
  }

  /**
   * Reorders a menu item among its existing siblings.
   */
  async reorder(
    id: string,
    reorderMenuDto: ReorderMenuDto,
  ): Promise<MenuResponseDto> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const menu = await manager.findOne(Menu, {
        where: { id },
      });

      if (!menu) {
        throw new NotFoundException(`Menu with ID "${id}" not found`);
      }

      const siblings = await manager.find(Menu, {
        where: { parentId: menu.parentId ? menu.parentId : IsNull() },
        order: { position: 'ASC' },
      });

      if (
        reorderMenuDto.position < 0 ||
        reorderMenuDto.position >= siblings.length
      ) {
        throw new BadRequestException('Target position is out of range');
      }

      if (reorderMenuDto.position === menu.position) {
        return this.buildResponseDto(menu, manager);
      }

      const filtered = siblings.filter((s) => s.id !== id);
      filtered.splice(reorderMenuDto.position, 0, menu);

      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].position !== i) {
          filtered[i].position = i;
          await manager.save(Menu, filtered[i]);
        }
      }

      return this.buildResponseDto(menu, manager);
    });
  }

  /**
   * Helper to compute depth and parentName, then return MenuResponseDto.
   */
  private async buildResponseDto(
    menu: Menu,
    manager?: EntityManager,
  ): Promise<MenuResponseDto> {
    const repo = manager ? manager.getRepository(Menu) : this.menuRepository;

    let parentName: string | null = null;
    let depth = 0;

    if (menu.parentId) {
      const parent = await repo.findOne({
        where: { id: menu.parentId },
      });
      parentName = parent?.name ?? null;

      let currentId: string | null = menu.parentId;
      const visited = new Set<string>();

      while (currentId) {
        if (visited.has(currentId)) {
          break;
        }
        visited.add(currentId);
        depth++;

        const ancestor: Menu | null = await repo.findOne({
          where: { id: currentId },
          select: ['id', 'parentId'],
        });
        currentId = ancestor ? ancestor.parentId : null;
      }
    }

    return {
      id: menu.id,
      name: menu.name,
      parentId: menu.parentId,
      parentName,
      depth,
      position: menu.position,
      createdAt: menu.createdAt.toISOString(),
      updatedAt: menu.updatedAt.toISOString(),
    };
  }

  /**
   * Helper to calculate depth of a given node ID.
   */
  private async calculateDepth(
    id: string,
    manager: EntityManager,
  ): Promise<number> {
    let depth = 0;
    let current: Menu | null = await manager.findOne(Menu, {
      where: { id },
      select: ['id', 'parentId'],
    });

    const visited = new Set<string>();
    while (current && current.parentId) {
      if (visited.has(current.id)) {
        break;
      }
      visited.add(current.id);
      depth++;
      current = await manager.findOne(Menu, {
        where: { id: current.parentId },
        select: ['id', 'parentId'],
      });
    }

    return depth;
  }
}
