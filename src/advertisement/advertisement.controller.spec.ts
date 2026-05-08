import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';
import { AppLogger } from 'src/common/logger/app-logger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

const mockAdvertisementService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  remove: jest.fn(),
};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('AdvertisementController', () => {
  let controller: AdvertisementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvertisementController],
      providers: [
        { provide: AdvertisementService, useValue: mockAdvertisementService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdvertisementController>(AdvertisementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
