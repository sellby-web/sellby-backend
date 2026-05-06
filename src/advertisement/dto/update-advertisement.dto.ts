import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdvertisementDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 450, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  author?: string;
}

export class UpdateAdStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'SOLD', 'UNAVAILABLE'] })
  @IsIn(['ACTIVE', 'SOLD', 'UNAVAILABLE'])
  status!: 'ACTIVE' | 'SOLD' | 'UNAVAILABLE';
}
