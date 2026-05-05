import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import {
  UpdateAdvertisementDto,
  UpdateAdStatusDto,
} from './dto/update-advertisement.dto';
import { ListAdvertisementDto } from './dto/list-advertisement.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import type {
  AdWithDetail,
  AdWithSummary,
} from './dto/advertisement-response.dto';
import type { Advertisement } from 'generated/prisma/client';

@Controller('advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAdvertisementDto,
  ): Promise<AdWithDetail> {
    return this.advertisementService.create(user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() dto: ListAdvertisementDto,
  ): Promise<{ data: AdWithSummary[]; total: number }> {
    return this.advertisementService.findAll(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<AdWithDetail> {
    return this.advertisementService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAdvertisementDto,
  ): Promise<AdWithSummary> {
    return this.advertisementService.update(id, user.userId, dto);
  }
  //TODO: update return type later on
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAdStatusDto,
  ): Promise<Pick<Advertisement, 'id' | 'status' | 'updatedAt'>> {
    return this.advertisementService.updateStatus(id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Pick<Advertisement, 'id' | 'isDeleted'>> {
    return this.advertisementService.remove(id, user.userId);
  }
}
