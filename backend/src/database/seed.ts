import dataSource from './data-source';
import { Menu } from '../menus/menu.entity';

export const SYSTEM_CODE_ID = '56320ee9-6af6-11ed-a7ba-f220afe5e4a9';

interface SeedNode {
  id?: string;
  name: string;
  children?: SeedNode[];
}

export const figmaSeedTree: SeedNode = {
  name: 'system management',
  children: [
    {
      name: 'System Management',
      children: [
        {
          name: 'Systems',
          children: [
            {
              id: SYSTEM_CODE_ID,
              name: 'System Code',
              children: [{ name: 'Code Registration' }],
            },
            { name: 'Code Registration - 2' },
            { name: 'Properties' },
            {
              name: 'Menus',
              children: [{ name: 'Menu Registration' }],
            },
            {
              name: 'API List',
              children: [{ name: 'API Registration' }, { name: 'API Edit' }],
            },
          ],
        },
        {
          name: 'Users & Groups',
          children: [
            {
              name: 'Users',
              children: [{ name: 'User Account Registration' }],
            },
            {
              name: 'Groups',
              children: [{ name: 'User Group Registration' }],
            },
            {
              name: '사용자 승인',
              children: [{ name: '사용자 승인 상세' }],
            },
          ],
        },
      ],
    },
  ],
};

export async function runSeed(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const menuRepo = queryRunner.manager.getRepository(Menu);

    // Clean existing data for idempotency
    await queryRunner.query('TRUNCATE TABLE "menus" CASCADE');

    async function insertNode(
      node: SeedNode,
      parentId: string | null,
      position: number,
    ): Promise<string> {
      const menu = menuRepo.create({
        ...(node.id ? { id: node.id } : {}),
        name: node.name,
        parentId,
        position,
      });

      const saved = await menuRepo.save(menu);

      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          await insertNode(node.children[i], saved.id, i);
        }
      }

      return saved.id;
    }

    await insertNode(figmaSeedTree, null, 0);

    await queryRunner.commitTransaction();
    console.log('Database seeded successfully with Figma menu tree demo data.');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Failed to seed database:', error);
    throw error;
  } finally {
    await queryRunner.release();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
