import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppLogger } from 'src/common/logger/app-logger';

const mockPrismaService = {};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('WishlistService', () => {
  let service: WishlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
