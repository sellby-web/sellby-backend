import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { AssetModule } from './asset/asset.module';
import { MessageModule } from './message/message.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    AuthModule,
    AdvertisementModule,
    AssetModule,
    MessageModule,
    WishlistModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
