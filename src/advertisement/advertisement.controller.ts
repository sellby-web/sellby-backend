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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
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
import { AppLogger } from 'src/common/logger/app-logger';
import type { AdWithDetail, AdWithSummary } from './dto/advertisement-response.dto';
import type { Advertisement } from 'generated/prisma/client';

@ApiTags('Advertisements')
@ApiCookieAuth('Authentication')
@Controller('advertisement')
export class AdvertisementController {
  constructor(
    private readonly advertisementService: AdvertisementService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new advertisement' })
  @ApiBody({ type: CreateAdvertisementDto })
  @ApiResponse({ status: 201, description: 'Advertisement created' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  async create(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAdvertisementDto,
  ): Promise<AdWithDetail> {
    this.logger.info('AdvertisementController', 'create received', req.meta, { userId: user.userId, body: dto });
    const result = await this.advertisementService.create(user.userId, dto);
    this.logger.info('AdvertisementController', 'create response', req.meta, { adId: result.id });
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List advertisements with optional filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of advertisements' })
  async findAll(
    @Req() req: Request,
    @Query() dto: ListAdvertisementDto,
  ): Promise<{ data: AdWithSummary[]; total: number }> {
    this.logger.info('AdvertisementController', 'findAll received', req.meta, { query: dto });
    const result = await this.advertisementService.findAll(dto);
    this.logger.info('AdvertisementController', 'findAll response', req.meta, { total: result.total });
    return result;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a single advertisement by ID' })
  @ApiParam({ name: 'id', description: 'Advertisement UUID' })
  @ApiResponse({ status: 200, description: 'Advertisement detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Req() req: Request, @Param('id') id: string): Promise<AdWithDetail> {
    this.logger.info('AdvertisementController', 'findOne received', req.meta, { id });
    const result = await this.advertisementService.findOne(id);
    this.logger.info('AdvertisementController', 'findOne response', req.meta, { adId: result.id });
    return result;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an advertisement (owner only)' })
  @ApiParam({ name: 'id', description: 'Advertisement UUID' })
  @ApiBody({ type: UpdateAdvertisementDto })
  @ApiResponse({ status: 200, description: 'Updated advertisement' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAdvertisementDto,
  ): Promise<AdWithSummary> {
    this.logger.info('AdvertisementController', 'update received', req.meta, { id, userId: user.userId, body: dto });
    const result = await this.advertisementService.update(id, user.userId, dto);
    this.logger.info('AdvertisementController', 'update response', req.meta, { adId: result.id });
    return result;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update the status of an advertisement (owner only)' })
  @ApiParam({ name: 'id', description: 'Advertisement UUID' })
  @ApiBody({ type: UpdateAdStatusDto })
  @ApiResponse({ status: 200, description: 'Updated status' })
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAdStatusDto,
  ): Promise<Pick<Advertisement, 'id' | 'status' | 'updatedAt'>> {
    this.logger.info('AdvertisementController', 'updateStatus received', req.meta, { id, userId: user.userId, body: dto });
    const result = await this.advertisementService.updateStatus(id, user.userId, dto);
    this.logger.info('AdvertisementController', 'updateStatus response', req.meta, { result });
    return result;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft-delete an advertisement (owner only)' })
  @ApiParam({ name: 'id', description: 'Advertisement UUID' })
  @ApiResponse({ status: 200, description: 'Deleted advertisement' })
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Pick<Advertisement, 'id' | 'isDeleted'>> {
    this.logger.info('AdvertisementController', 'remove received', req.meta, { id, userId: user.userId });
    const result = await this.advertisementService.remove(id, user.userId);
    this.logger.info('AdvertisementController', 'remove response', req.meta, { result });
    return result;
  }
}
