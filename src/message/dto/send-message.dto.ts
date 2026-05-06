import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsUUID('4')
  receiverId!: string;

  @IsUUID('4')
  advertisementId!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;
}
