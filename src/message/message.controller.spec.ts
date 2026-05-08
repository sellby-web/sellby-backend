import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { AppLogger } from 'src/common/logger/app-logger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

const mockMessageService = {
  sendMessage: jest.fn(),
  getConversationList: jest.fn(),
  getConversation: jest.fn(),
  markViewed: jest.fn(),
};
const mockAppLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('MessageController', () => {
  let controller: MessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        { provide: MessageService, useValue: mockMessageService },
        { provide: AppLogger, useValue: mockAppLogger },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
