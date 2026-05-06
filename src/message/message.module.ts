import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway, PrismaService],
})
export class MessageModule {}
