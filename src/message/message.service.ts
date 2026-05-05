import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { AppLogger } from 'src/common/logger/app-logger';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto) {
    this.logger.info('MessageService', 'sendMessage called', undefined, { senderId, dto });
    const ad = await this.prisma.advertisement.findUnique({
      where: { id: dto.advertisementId },
      select: { status: true, isDeleted: true },
    });
    if (!ad || ad.isDeleted) throw new NotFoundException('Advertisement not found');
    if (ad.status !== 'ACTIVE') {
      throw new ForbiddenException('This ad is no longer accepting messages');
    }

    const result = await this.prisma.message.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        advertisementId: dto.advertisementId,
        message: dto.message,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    this.logger.info('MessageService', 'sendMessage done', undefined, { messageId: result.id });
    return result;
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    advertisementId: string,
    dto: GetHistoryDto,
  ) {
    this.logger.info('MessageService', 'getConversation called', undefined, { userId, otherUserId, advertisementId, dto });
    const { skip = 0, take = 50 } = dto;
    const where = {
      advertisementId,
      isDeleted: false,
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
          receiver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    this.logger.info('MessageService', 'getConversation done', undefined, { total });
    return { data, total };
  }

  async getConversationList(userId: string) {
    this.logger.info('MessageService', 'getConversationList called', undefined, { userId });
    const messages = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT ON (
        m.advertisement_id,
        LEAST(m.sender_id, m.receiver_id),
        GREATEST(m.sender_id, m.receiver_id)
      )
        m.id,
        m.advertisement_id AS "advertisementId",
        m.sender_id AS "senderId",
        m.receiver_id AS "receiverId",
        m.message,
        m.created_at AS "createdAt",
        m.is_viewed AS "isViewed",
        a.title AS "adTitle",
        a.status AS "adStatus"
      FROM messages m
      JOIN advertisements a ON a.id = m.advertisement_id
      WHERE
        (m.sender_id = ${userId}::uuid OR m.receiver_id = ${userId}::uuid)
        AND m.is_deleted = false
      ORDER BY
        m.advertisement_id,
        LEAST(m.sender_id, m.receiver_id),
        GREATEST(m.sender_id, m.receiver_id),
        m.created_at DESC
    `;
    this.logger.info('MessageService', 'getConversationList done', undefined, { count: messages.length });
    return messages;
  }

  async markViewed(userId: string, messageIds: string[]) {
    this.logger.info('MessageService', 'markViewed called', undefined, { userId, messageIds });
    const result = await this.prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: userId,
      },
      data: { isViewed: true },
    });
    this.logger.info('MessageService', 'markViewed done', undefined, { count: result.count });
    return result;
  }
}
