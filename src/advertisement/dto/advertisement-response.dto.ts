import type { Advertisement, Asset, User } from 'generated/prisma/client';

export type AdWithDetail = Advertisement & {
  assets: Asset[];
  creator: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
};

export type AdWithSummary = Advertisement & {
  assets: Asset[];
  creator: Pick<User, 'id' | 'firstName' | 'lastName'>;
};
