import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
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
   * Retrieves full menu tree hierarchically ordered by sibling position
   */
  async getTree(): Promise<MenuTreeNodeDto[]> {
    const menus = await this.menuRepository.find({
      order: { position: 'ASC' },
    });
    return buildTree(menus);
  }

  /**
   * Finds a single menu item with derived depth and parent name
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
   * Creates a new menu item, appending to the end of siblings
   */
  async create(createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    const parentId = createMenuDto.parentId || null;

    if (parentId) {
      const parentExists = await this.menuRepository.findOne({
        where: { id: parentId },
      });
      if (!parentExists) {
        throw new NotFoundException(
          `Parent menu with ID "${parentId}" not found`,
        );
      }
    }

    // Determine position: count existing siblings
    const siblingCount = await this.menuRepository.count({
      where: { parentId: parentId ? parentId : IsNull() },
    });

    const newMenu = this.menuRepository.create({
      name: createMenuDto.name.trim(),
      parentId: parentId,
      position: siblingCount,
    });

    const savedMenu = await this.menuRepository.save(newMenu);
    return this.buildResponseDto(savedMenu);
  }

  /**
   * Updates only menu name
   */
  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    if (updateMenuDto.name !== undefined) {
      const trimmed = updateMenuDto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Menu name cannot be empty');
      }
      menu.name = trimmed;
    }

    const saved = await this.menuRepository.save(menu);
    return this.buildResponseDto(saved);
  }

  /**
   * Deletes a menu item and all its descendants cascade, then recompacts sibling positions
   */
  async delete(id: string): Promise<void> {
    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    const parentId = menu.parentId;

    await this.dataSource.transaction(async (manager) => {
      // Find all descendant IDs via iterative BFS/DFS
      const allMenus = await manager.find(Menu);
      const toDeleteIds = new Set<string>([id]);
      let added = true;

      while (added) {
        added = false;
        for (const m of allMenus) {
          if (
            m.parentId &&
            toDeleteIds.has(m.parentId) &&
            !toDeleteIds.has(m.id)
          ) {
            toDeleteIds.add(m.id);
            added = true;
          }
        }
      }

      // Delete target and descendants
      await manager.delete(Menu, Array.from(toDeleteIds));

      // Recompact remaining siblings of deleted node
      const siblings = await manager.find(Menu, {
        where: { parentId: parentId ? parentId : IsNull() },
        order: { position: 'ASC' },
      });

      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].position !== i) {
          siblings[i].position = i;
          await manager.save(siblings[i]);
        }
      }
    });
  }

  /**
   * Builds single MenuResponseDto with derived depth and parentName
   */
  private async buildResponseDto(
    menu: Menu,
    manager?: EntityManager,
  ): Promise<MenuResponseDto> {
    const repo = manager ? manager.getRepository(Menu) : this.menuRepository;

    let parentName: string | null = null;
    if (menu.parentId) {
      const parent = await repo.findOne({
        where: { id: menu.parentId },
        select: ['id', 'name'],
      });
      parentName = parent ? parent.name : null;
    }

    const depth = await this.computeDepth(menu, repo);

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
   * Computes 0-based depth by traversing upwards to root
   */
  private async computeDepth(
    menu: Menu,
    repo: Repository<Menu>,
  ): Promise<number> {
    let depth = 0;
    let currentParentId = menu.parentId;
    const visited = new Set<string>([menu.id]);

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        break; // Guard against cycle loops
      }
      visited.add(currentParentId);
      depth++;

      const parent: Menu | null = await repo.findOne({
        where: { id: currentParentId },
        select: ['id', 'parentId'],
      });

      currentParentId = parent ? parent.parentId : null;
    }

    return depth;
  }
}
