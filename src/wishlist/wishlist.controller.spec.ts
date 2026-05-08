import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { AppLogger } from 'src/common/logger/app-logger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

const mockWishlistService = {
  getWishlist: jest.fn(),
  addItem: jest.fn(),
  removeItem: jest.fn(),
};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('WishlistController', () => {
  let controller: WishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        { provide: WishlistService, useValue: mockWishlistService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WishlistController>(WishlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
