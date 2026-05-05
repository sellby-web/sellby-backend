import type { Wishlist, WishlistAdvertisement, Advertisement, Asset, User } from 'generated/prisma/client';

export type WishlistWithAds = Wishlist & {
  wishlistAds: (WishlistAdvertisement & {
    advertisement: Advertisement & {
      assets: Asset[];
      creator: Pick<User, 'id' | 'firstName' | 'lastName'>;
    };
  })[];
};

export type WishlistItemWithAd = WishlistAdvertisement & {
  advertisement: Pick<Advertisement, 'id' | 'title' | 'price' | 'status'>;
};
