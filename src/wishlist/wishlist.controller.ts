import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AppLogger } from 'src/common/logger/app-logger';
import type { WishlistWithAds, WishlistItemWithAd } from './dto/wishlist-response.dto';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  async getWishlist(@Req() req: Request, @CurrentUser() user: JwtPayload): Promise<WishlistWithAds | null> {
    this.logger.info('WishlistController', 'getWishlist received', req.meta.requestId, { userId: user.userId });
    const result = await this.wishlistService.getWishlist(user.userId);
    this.logger.info('WishlistController', 'getWishlist response', req.meta.requestId, { wishlistId: result?.id });
    return result;
  }

  @Post('items')
  async addItem(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddWishlistItemDto,
  ): Promise<WishlistItemWithAd> {
    this.logger.info('WishlistController', 'addItem received', req.meta.requestId, { userId: user.userId, body: dto });
    const result = await this.wishlistService.addItem(user.userId, dto);
    this.logger.info('WishlistController', 'addItem response', req.meta.requestId, { result });
    return result;
  }

  @Delete('items/:advertisementId')
  async removeItem(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Param('advertisementId') advertisementId: string,
  ): Promise<{ message: string }> {
    this.logger.info('WishlistController', 'removeItem received', req.meta.requestId, { userId: user.userId, advertisementId });
    const result = await this.wishlistService.removeItem(user.userId, advertisementId);
    this.logger.info('WishlistController', 'removeItem response', req.meta.requestId, { result });
    return result;
  }
}
