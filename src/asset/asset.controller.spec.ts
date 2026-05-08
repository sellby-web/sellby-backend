import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { AppLogger } from 'src/common/logger/app-logger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

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

const mockAssetService = {
  generateUploadUrl: jest.fn(),
  generateViewUrl: jest.fn(),
  createRecord: jest.fn(),
  removeRecord: jest.fn(),
};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('AssetController', () => {
  let controller: AssetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        { provide: AssetService, useValue: mockAssetService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AssetController>(AssetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
