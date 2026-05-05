import { IsString, IsNotEmpty, IsInt, IsUUID, Min } from 'class-validator';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  url!: string;

  @IsUUID('4')
  advertisementId!: string;

  @IsInt()
  @Min(0)
  position!: number;
}
