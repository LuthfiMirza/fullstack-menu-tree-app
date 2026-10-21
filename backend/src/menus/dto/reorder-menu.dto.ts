import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReorderMenuDto {
  @ApiProperty({
    example: 1,
    description: 'New 0-based position among existing siblings',
    minimum: 0,
  })
  @IsInt({ message: 'position must be an integer' })
  @Min(0, { message: 'position must be greater than or equal to 0' })
  position!: number;
}
