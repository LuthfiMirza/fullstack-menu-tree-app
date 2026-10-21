import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateIf,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    example: 'System Code',
    description: 'Menu name (1-100 characters, trimmed)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'name must not be empty' })
  @Length(1, 100, { message: 'name must be between 1 and 100 characters' })
  name!: string;

  @ApiPropertyOptional({
    example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a9',
    description: 'Parent menu UUID or null for root menu',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsUUID('all', { message: 'parentId must be a valid UUID' })
  parentId?: string | null;
}
