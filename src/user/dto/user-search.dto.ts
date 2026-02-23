import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class UserSearchDto {
  @IsNotEmpty()
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}
