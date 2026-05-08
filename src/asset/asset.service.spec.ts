import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './asset.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppLogger } from 'src/common/logger/app-logger';

jest.mock('src/supabase/supabase.client', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        createSignedUploadUrl: jest.fn(),
        createSignedUrl: jest.fn(),
      }),
    },
  },
}));

const mockPrismaService = {};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
