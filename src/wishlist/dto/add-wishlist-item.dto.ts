import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWishlistItemDto {
  @ApiProperty({ description: 'UUID of the advertisement to add to the wishlist' })
  @IsUUID('4')
  advertisementId!: string;
}
