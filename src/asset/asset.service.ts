import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import type { Asset } from 'generated/prisma/client';
import type {
  UploadUrlResponse,
  ViewUrlResponse,
  AssetDeleteResponse,
} from './dto/asset-response.dto';

@Injectable()
export class AssetService {
  private bucket = process.env.BUCKET_NAME || 'ad-images';

  constructor(private readonly prisma: PrismaService) {}

  async generateUploadUrl(fileName: string): Promise<UploadUrlResponse> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(fileName);
    if (error) throw error;
    return data!;
  }

  async generateViewUrl(path: string): Promise<ViewUrlResponse> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, 3600);
    if (error) throw error;
    return data!;
  }

  async createRecord(userId: string, dto: CreateAssetDto): Promise<Asset> {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id: dto.advertisementId },
      select: { createdBy: true, isDeleted: true },
    });
    if (!ad || ad.isDeleted) throw new NotFoundException('Advertisement not found');
    if (ad.createdBy !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.asset.create({
      data: {
        url: dto.url,
        advertisementId: dto.advertisementId,
        position: dto.position,
        createdBy: userId,
      },
    });
  }

  async removeRecord(assetId: string, userId: string): Promise<AssetDeleteResponse> {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      select: { createdBy: true, isDeleted: true },
    });
    if (!asset || asset.isDeleted) throw new NotFoundException('Asset not found');
    if (asset.createdBy !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.asset.update({
      where: { id: assetId },
      data: { isDeleted: true, deletedAt: new Date() },
      select: { id: true, isDeleted: true },
    });
  }
}
