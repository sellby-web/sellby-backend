import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  providers: [AssetService, PrismaService],
  controllers: [AssetController],
})
export class AssetModule {}
