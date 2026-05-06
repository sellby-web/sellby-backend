import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [WishlistController],
  providers: [WishlistService, PrismaService],
})
export class WishlistModule {}
