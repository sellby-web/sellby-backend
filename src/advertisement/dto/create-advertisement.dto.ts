import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAdvertisementDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assetIds?: string[];
}
