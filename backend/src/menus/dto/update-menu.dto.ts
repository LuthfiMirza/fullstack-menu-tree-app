import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateMenuDto {
  @ApiProperty({
    example: 'Updated System Code',
    description: 'Updated menu name (1-100 characters, trimmed)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'name must not be empty' })
  @Length(1, 100, { message: 'name must be between 1 and 100 characters' })
  name!: string;
}
