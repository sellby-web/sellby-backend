import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkViewedDto {
  @ApiProperty({ type: [String], description: 'Array of message UUIDs to mark as viewed' })
  @IsArray()
  @IsUUID('4', { each: true })
  messageIds!: string[];
}
