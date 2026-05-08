import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdvertisementDto {
  @ApiProperty({ example: 'Used iPhone 13' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Great condition, barely used, comes with original box' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ example: 500, minimum: 0 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ type: [String], description: 'UUIDs of pre-uploaded assets to attach' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assetIds?: string[];
}
