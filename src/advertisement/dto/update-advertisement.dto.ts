import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';

export class UpdateAdvertisementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  author?: string;
}

export class UpdateAdStatusDto {
  @IsIn(['ACTIVE', 'SOLD', 'UNAVAILABLE'])
  status!: 'ACTIVE' | 'SOLD' | 'UNAVAILABLE';
}
