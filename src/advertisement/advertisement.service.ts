import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto, UpdateAdStatusDto } from './dto/update-advertisement.dto';
import { ListAdvertisementDto } from './dto/list-advertisement.dto';
import { AppLogger } from 'src/common/logger/app-logger';
import type { Advertisement, Prisma } from 'generated/prisma/client';
import type { AdWithDetail, AdWithSummary } from './dto/advertisement-response.dto';

@Injectable()
export class AdvertisementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  async create(userId: string, dto: CreateAdvertisementDto): Promise<AdWithDetail> {
    this.logger.info('AdvertisementService', 'create called', undefined, { userId, dto });
    const { assetIds, ...rest } = dto;
    const ad = await this.prisma.advertisement.create({
      data: { ...rest, createdBy: userId },
    });

    if (assetIds?.length) {
      await this.prisma.asset.updateMany({
        where: { id: { in: assetIds }, createdBy: userId },
        data: { advertisementId: ad.id },
      });
    }

    const result = await this.findOne(ad.id);
    this.logger.info('AdvertisementService', 'create done', undefined, { adId: result.id });
    return result;
  }

  async findAll(dto: ListAdvertisementDto): Promise<{ data: AdWithSummary[]; total: number }> {
    this.logger.info('AdvertisementService', 'findAll called', undefined, { dto });
    const { skip = 0, take = 20, search, status } = dto;
    const where: Prisma.AdvertisementWhereInput = { isDeleted: false };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.advertisement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assets: { where: { isDeleted: false }, orderBy: { position: 'asc' } },
          creator: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.advertisement.count({ where }),
    ]);

    this.logger.info('AdvertisementService', 'findAll done', undefined, { total });
    return { data: data as AdWithSummary[], total };
  }

  async findOne(id: string): Promise<AdWithDetail> {
    this.logger.info('AdvertisementService', 'findOne called', undefined, { id });
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
      include: {
        assets: { where: { isDeleted: false }, orderBy: { position: 'asc' } },
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!ad || ad.isDeleted) throw new NotFoundException('Advertisement not found');
    this.logger.info('AdvertisementService', 'findOne done', undefined, { adId: ad.id });
    return ad as AdWithDetail;
  }

  async update(id: string, userId: string, dto: UpdateAdvertisementDto): Promise<AdWithSummary> {
    this.logger.info('AdvertisementService', 'update called', undefined, { id, userId, dto });
    await this.assertOwner(id, userId);
    const ad = await this.prisma.advertisement.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
      include: {
        assets: { where: { isDeleted: false }, orderBy: { position: 'asc' } },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    this.logger.info('AdvertisementService', 'update done', undefined, { adId: id });
    return ad as AdWithSummary;
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateAdStatusDto,
  ): Promise<Pick<Advertisement, 'id' | 'status' | 'updatedAt'>> {
    this.logger.info('AdvertisementService', 'updateStatus called', undefined, { id, userId, status: dto.status });
    await this.assertOwner(id, userId);
    const result = await this.prisma.advertisement.update({
      where: { id },
      data: { status: dto.status, updatedAt: new Date() },
      select: { id: true, status: true, updatedAt: true },
    });
    this.logger.info('AdvertisementService', 'updateStatus done', undefined, { adId: id, status: result.status });
    return result;
  }

  async remove(id: string, userId: string): Promise<Pick<Advertisement, 'id' | 'isDeleted'>> {
    this.logger.info('AdvertisementService', 'remove called', undefined, { id, userId });
    await this.assertOwner(id, userId);
    const result = await this.prisma.advertisement.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() },
      select: { id: true, isDeleted: true },
    });
    this.logger.info('AdvertisementService', 'remove done', undefined, { adId: id });
    return result;
  }

  private async assertOwner(id: string, userId: string): Promise<void> {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
      select: { createdBy: true, isDeleted: true },
    });
    if (!ad || ad.isDeleted) throw new NotFoundException('Advertisement not found');
    if (ad.createdBy !== userId) throw new ForbiddenException('Access denied');
  }
}
