import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementService } from './advertisement.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppLogger } from 'src/common/logger/app-logger';

const mockPrismaService = {};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('AdvertisementService', () => {
  let service: AdvertisementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvertisementService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    }).compile();

    service = module.get<AdvertisementService>(AdvertisementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
