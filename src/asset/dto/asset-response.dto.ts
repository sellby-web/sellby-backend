import type { Asset } from 'generated/prisma/client';

export type UploadUrlResponse = {
  signedUrl: string;
  token: string;
  path: string;
};

export type ViewUrlResponse = {
  signedUrl: string;
};

export type AssetDeleteResponse = Pick<Asset, 'id' | 'isDeleted'>;
