import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenusTable1700000000000 implements MigrationInterface {
  name = 'CreateMenusTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menus" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "parent_id" uuid NULL,
        "position" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_menus_parent" FOREIGN KEY ("parent_id") REFERENCES "menus"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_menus_position_nonneg" CHECK ("position" >= 0),
        CONSTRAINT "chk_menus_not_self_parent" CHECK ("parent_id" IS NULL OR "parent_id" <> "id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_menus_parent_position" ON "menus" ("parent_id", "position")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_menus_parent_position"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menus"`);
  }
}
