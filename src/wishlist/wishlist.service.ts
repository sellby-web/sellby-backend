import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { AppLogger } from 'src/common/logger/app-logger';
import type { Wishlist } from 'generated/prisma/client';
import type { WishlistWithAds, WishlistItemWithAd } from './dto/wishlist-response.dto';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  private async getOrCreateWishlist(userId: string): Promise<Wishlist> {
    return this.prisma.wishlist.upsert({
      where: { ownerId: userId },
      create: { ownerId: userId },
      update: {},
    });
  }

  async getWishlist(userId: string): Promise<WishlistWithAds | null> {
    this.logger.info('WishlistService', 'getWishlist called', undefined, { userId });
    const wishlist = await this.getOrCreateWishlist(userId);
    const result = await this.prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: {
        wishlistAds: {
          orderBy: { createdAt: 'desc' },
          include: {
            advertisement: {
              include: {
                assets: { where: { isDeleted: false }, orderBy: { position: 'asc' } },
                creator: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
    this.logger.info('WishlistService', 'getWishlist done', undefined, { wishlistId: result?.id });
    return result;
  }

  async addItem(userId: string, dto: AddWishlistItemDto): Promise<WishlistItemWithAd> {
    this.logger.info('WishlistService', 'addItem called', undefined, { userId, dto });
    const ad = await this.prisma.advertisement.findUnique({
      where: { id: dto.advertisementId },
      select: { id: true, isDeleted: true },
    });
    if (!ad || ad.isDeleted) throw new NotFoundException('Advertisement not found');

    const wishlist = await this.getOrCreateWishlist(userId);

    try {
      const result = await this.prisma.wishlistAdvertisement.create({
        data: {
          wishlistId: wishlist.id,
          advertisementId: dto.advertisementId,
          createdBy: userId,
        },
        include: {
          advertisement: { select: { id: true, title: true, price: true, status: true } },
        },
      });
      this.logger.info('WishlistService', 'addItem done', undefined, { advertisementId: dto.advertisementId });
      return result;
    } catch (err: any) {
      if (err.code === 'P2002') throw new ConflictException('Already in wishlist');
      throw err;
    }
  }

  async removeItem(userId: string, advertisementId: string): Promise<{ message: string }> {
    this.logger.info('WishlistService', 'removeItem called', undefined, { userId, advertisementId });
    const wishlist = await this.prisma.wishlist.findUnique({ where: { ownerId: userId } });
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    const item = await this.prisma.wishlistAdvertisement.findUnique({
      where: { wishlistId_advertisementId: { wishlistId: wishlist.id, advertisementId } },
    });
    if (!item) throw new NotFoundException('Item not in wishlist');

    await this.prisma.wishlistAdvertisement.delete({
      where: { wishlistId_advertisementId: { wishlistId: wishlist.id, advertisementId } },
    });

    this.logger.info('WishlistService', 'removeItem done', undefined, { advertisementId });
    return { message: 'Removed from wishlist' };
  }
}
