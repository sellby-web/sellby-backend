import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AppLogger } from 'src/common/logger/app-logger';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.info('UserController', 'create received', req.meta.requestId, { body: createUserDto });
    const result = await this.userService.create(createUserDto);
    this.logger.info('UserController', 'create response', req.meta.requestId, { result });
    return result;
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query() paginationDto: UserPaginationDto,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    this.logger.info('UserController', 'findAll received', req.meta.requestId, { query: paginationDto });
    const result = await this.userService.findAll(paginationDto.skip, paginationDto.take);
    this.logger.info('UserController', 'findAll response', req.meta.requestId, { total: result.total });
    return result;
  }

  @Get('search')
  async search(
    @Req() req: Request,
    @Query() searchDto: UserSearchDto,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    this.logger.info('UserController', 'search received', req.meta.requestId, { query: searchDto });
    const result = await this.userService.search(searchDto.query, searchDto.skip, searchDto.take);
    this.logger.info('UserController', 'search response', req.meta.requestId, { total: result.total });
    return result;
  }

  @Get('deleted')
  async getDeletedUsers(@Req() req: Request): Promise<UserResponseDto[]> {
    this.logger.info('UserController', 'getDeletedUsers received', req.meta.requestId);
    const result = await this.userService.getDeletedUsers();
    this.logger.info('UserController', 'getDeletedUsers response', req.meta.requestId, { count: result.length });
    return result;
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'findOne received', req.meta.requestId, { id });
    const result = await this.userService.findOne(id);
    this.logger.info('UserController', 'findOne response', req.meta.requestId, { result });
    return result;
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.info('UserController', 'update received', req.meta.requestId, { id, body: updateUserDto });
    const result = await this.userService.update(id, updateUserDto);
    this.logger.info('UserController', 'update response', req.meta.requestId, { result });
    return result;
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'remove received', req.meta.requestId, { id });
    const result = await this.userService.remove(id);
    this.logger.info('UserController', 'remove response', req.meta.requestId, { result });
    return result;
  }

  @Delete(':id/hard')
  async hardDelete(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'hardDelete received', req.meta.requestId, { id });
    const result = await this.userService.hardDelete(id);
    this.logger.info('UserController', 'hardDelete response', req.meta.requestId, { result });
    return result;
  }

  @Patch(':id/restore')
  async restore(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'restore received', req.meta.requestId, { id });
    const result = await this.userService.restore(id);
    this.logger.info('UserController', 'restore response', req.meta.requestId, { result });
    return result;
  }
}
