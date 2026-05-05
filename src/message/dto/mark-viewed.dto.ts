import { IsArray, IsUUID } from 'class-validator';

export class MarkViewedDto {
  @IsArray()
  @IsUUID('4', { each: true })
  messageIds!: string[];
}
