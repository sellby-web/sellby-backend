import { IsOptional, IsNumber, Min } from 'class-validator';

export class UserPaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}