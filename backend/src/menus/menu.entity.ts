import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('menus')
@Index('idx_menus_parent_position', ['parentId', 'position'])
@Check('chk_menus_position_nonneg', '"position" >= 0')
@Check(
  'chk_menus_not_self_parent',
  '"parent_id" IS NULL OR "parent_id" <> "id"',
)
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;

  @Column({ type: 'integer', default: 0 })
  position!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Menu, (menu) => menu.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Menu | null;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children?: Menu[];
}
