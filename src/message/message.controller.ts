import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { MarkViewedDto } from './dto/mark-viewed.dto';
import { AppLogger } from 'src/common/logger/app-logger';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  async send(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto,
  ) {
    this.logger.info('MessageController', 'send received', req.meta, {
      userId: user.userId,
      body: dto,
    });
    const result = await this.messageService.sendMessage(user.userId, dto);
    this.logger.info('MessageController', 'send response', req.meta, {
      messageId: result.id,
    });
    return result;
  }

  @Get('conversations')
  async getConversationList(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
  ) {
    this.logger.info(
      'MessageController',
      'getConversationList received',
      req.meta,
      { userId: user.userId },
    );
    const result = await this.messageService.getConversationList(user.userId);
    this.logger.info(
      'MessageController',
      'getConversationList response',
      req.meta,
      { count: result.length },
    );
    return result;
  }

  @Get('conversations/:advertisementId/:otherUserId')
  async getConversation(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Param('advertisementId') advertisementId: string,
    @Param('otherUserId') otherUserId: string,
    @Query() dto: GetHistoryDto,
  ) {
    this.logger.info(
      'MessageController',
      'getConversation received',
      req.meta,
      { userId: user.userId, advertisementId, otherUserId, query: dto },
    );
    const result = await this.messageService.getConversation(
      user.userId,
      otherUserId,
      advertisementId,
      dto,
    );
    this.logger.info(
      'MessageController',
      'getConversation response',
      req.meta,
      { total: result.total },
    );
    return result;
  }

  @Patch('viewed')
  async markViewed(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Body() dto: MarkViewedDto,
  ) {
    this.logger.info(
      'MessageController',
      'markViewed received',
      req.meta,
      { userId: user.userId, messageIds: dto.messageIds },
    );
    const result = await this.messageService.markViewed(
      user.userId,
      dto.messageIds,
    );
    this.logger.info(
      'MessageController',
      'markViewed response',
      req.meta,
      { result },
    );
    return result;
  }
}
