import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'UUID of the recipient user' })
  @IsUUID('4')
  receiverId!: string;

  @ApiProperty({ description: 'UUID of the advertisement being discussed' })
  @IsUUID('4')
  advertisementId!: string;

  @ApiProperty({ example: 'Is this still available?' })
  @IsNotEmpty()
  @IsString()
  message!: string;
}
