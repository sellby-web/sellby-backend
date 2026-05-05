import { Module } from '@nestjs/common';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [AdvertisementController],
  providers: [AdvertisementService, PrismaService],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
