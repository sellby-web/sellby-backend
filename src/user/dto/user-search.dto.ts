import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserSearchDto {
  @ApiProperty({ description: 'Search query matched against name and email' })
  @IsNotEmpty()
  @IsString()
  query!: string;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ minimum: 1, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}
