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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AppLogger } from 'src/common/logger/app-logger';
import type { WishlistWithAds, WishlistItemWithAd } from './dto/wishlist-response.dto';

@ApiTags('Wishlist')
@ApiCookieAuth('Authentication')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly logger: AppLogger,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get the authenticated user's wishlist with all saved advertisements" })
  @ApiResponse({ status: 200, description: 'Wishlist with advertisements, or null if none exists' })
  async getWishlist(@Req() req: Request, @CurrentUser() user: JwtPayload): Promise<WishlistWithAds | null> {
    this.logger.info('WishlistController', 'getWishlist received', req.meta, { userId: user.userId });
    const result = await this.wishlistService.getWishlist(user.userId);
    this.logger.info('WishlistController', 'getWishlist response', req.meta, { wishlistId: result?.id });
    return result;
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an advertisement to the wishlist' })
  @ApiBody({ type: AddWishlistItemDto })
  @ApiResponse({ status: 201, description: 'Item added to wishlist' })
  @ApiResponse({ status: 409, description: 'Advertisement already in wishlist' })
  async addItem(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddWishlistItemDto,
  ): Promise<WishlistItemWithAd> {
    this.logger.info('WishlistController', 'addItem received', req.meta, { userId: user.userId, body: dto });
    const result = await this.wishlistService.addItem(user.userId, dto);
    this.logger.info('WishlistController', 'addItem response', req.meta, { result });
    return result;
  }

  @Delete('items/:advertisementId')
  @ApiOperation({ summary: 'Remove an advertisement from the wishlist' })
  @ApiParam({ name: 'advertisementId', description: 'UUID of the advertisement to remove' })
  @ApiResponse({ status: 200, description: 'Item removed from wishlist' })
  @ApiResponse({ status: 404, description: 'Item not found in wishlist' })
  async removeItem(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Param('advertisementId') advertisementId: string,
  ): Promise<{ message: string }> {
    this.logger.info('WishlistController', 'removeItem received', req.meta, { userId: user.userId, advertisementId });
    const result = await this.wishlistService.removeItem(user.userId, advertisementId);
    this.logger.info('WishlistController', 'removeItem response', req.meta, { result });
    return result;
  }
}
