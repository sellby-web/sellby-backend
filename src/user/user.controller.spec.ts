import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AppLogger } from 'src/common/logger/app-logger';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  search: jest.fn(),
  getDeletedUsers: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
