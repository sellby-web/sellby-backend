import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import type { Asset } from 'generated/prisma/client';
import type {
  UploadUrlResponse,
  ViewUrlResponse,
  AssetDeleteResponse,
} from './dto/asset-response.dto';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('upload-url')
  getUploadUrl(@Query('fileName') fileName: string): Promise<UploadUrlResponse> {
    return this.assetService.generateUploadUrl(fileName);
  }

  @Get('view-url')
  getViewUrl(@Query('path') path: string): Promise<ViewUrlResponse> {
    return this.assetService.generateViewUrl(path);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createRecord(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAssetDto,
  ): Promise<Asset> {
    return this.assetService.createRecord(user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeRecord(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AssetDeleteResponse> {
    return this.assetService.removeRecord(id, user.userId);
  }
}
