import { ApiProperty } from '@nestjs/swagger';

export class MenuResponseDto {
  @ApiProperty({ example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a9' })
  id!: string;

  @ApiProperty({ example: 'System Code' })
  name!: string;

  @ApiProperty({
    example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a0',
    nullable: true,
  })
  parentId!: string | null;

  @ApiProperty({ example: 'Systems', nullable: true })
  parentName!: string | null;

  @ApiProperty({ example: 3 })
  depth!: number;

  @ApiProperty({ example: 0 })
  position!: number;

  @ApiProperty({ example: '2026-10-21T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-21T10:00:00.000Z' })
  updatedAt!: string;
}

export class MenuTreeNodeDto {
  @ApiProperty({ example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a9' })
  id!: string;

  @ApiProperty({ example: 'System Code' })
  name!: string;

  @ApiProperty({
    example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a0',
    nullable: true,
  })
  parentId!: string | null;

  @ApiProperty({ example: 3 })
  depth!: number;

  @ApiProperty({ example: 0 })
  position!: number;

  @ApiProperty({ type: () => [MenuTreeNodeDto] })
  children!: MenuTreeNodeDto[];
}
