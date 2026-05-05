import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AppLogger } from 'src/common/logger/app-logger';
import type { Asset } from 'generated/prisma/client';
import type {
  UploadUrlResponse,
  ViewUrlResponse,
  AssetDeleteResponse,
} from './dto/asset-response.dto';

@Controller('asset')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly logger: AppLogger,
  ) {}

  // no auth guard here: Supabase signed URLs are scoped to a specific path and expire after 1 hour,
  // so the endpoint does not need to gate on the caller's identity
  @Get('upload-url')
  async getUploadUrl(
    @Req() req: Request,
    @Query('fileName') fileName: string,
  ): Promise<UploadUrlResponse> {
    this.logger.info('AssetController', 'getUploadUrl received', req.meta, { fileName });
    const result = await this.assetService.generateUploadUrl(fileName);
    this.logger.info('AssetController', 'getUploadUrl response', req.meta, { path: result.path });
    return result;
  }

  @Get('view-url')
  async getViewUrl(
    @Req() req: Request,
    @Query('path') path: string,
  ): Promise<ViewUrlResponse> {
    this.logger.info('AssetController', 'getViewUrl received', req.meta, { path });
    const result = await this.assetService.generateViewUrl(path);
    this.logger.info('AssetController', 'getViewUrl response', req.meta);
    return result;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRecord(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAssetDto,
  ): Promise<Asset> {
    this.logger.info('AssetController', 'createRecord received', req.meta, { userId: user.userId, body: dto });
    const result = await this.assetService.createRecord(user.userId, dto);
    this.logger.info('AssetController', 'createRecord response', req.meta, { assetId: result.id });
    return result;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeRecord(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AssetDeleteResponse> {
    this.logger.info('AssetController', 'removeRecord received', req.meta, { id, userId: user.userId });
    const result = await this.assetService.removeRecord(id, user.userId);
    this.logger.info('AssetController', 'removeRecord response', req.meta, { result });
    return result;
  }
}
