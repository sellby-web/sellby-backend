import { IsString, IsNotEmpty, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ description: 'Supabase storage path returned by the upload-url endpoint' })
  @IsNotEmpty()
  @IsString()
  url!: string;

  @ApiProperty({ description: 'UUID of the advertisement this asset belongs to' })
  @IsUUID('4')
  advertisementId!: string;

  @ApiProperty({ example: 0, minimum: 0, description: 'Display order position' })
  @IsInt()
  @Min(0)
  position!: number;
}
