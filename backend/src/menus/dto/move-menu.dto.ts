import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min, ValidateIf } from 'class-validator';

export class MoveMenuDto {
  @ApiProperty({
    example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a9',
    description: 'Target parent UUID or null to move to root',
    nullable: true,
  })
  @ValidateIf((_, val) => val !== null)
  @IsUUID('all', { message: 'parentId must be a valid UUID or null' })
  parentId!: string | null;

  @ApiPropertyOptional({
    example: 0,
    description: 'Target position among siblings (0-indexed, optional)',
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'position must be an integer' })
  @Min(0, { message: 'position must be greater than or equal to 0' })
  position?: number;
}
