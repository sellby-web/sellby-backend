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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AppLogger } from 'src/common/logger/app-logger';

@ApiTags('Users')
@ApiCookieAuth('Authentication')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a user directly (admin use)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.info('UserController', 'create received', req.meta, { body: createUserDto });
    const result = await this.userService.create(createUserDto, req.meta);
    this.logger.info('UserController', 'create response', req.meta, { result });
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiResponse({ status: 200, schema: { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/UserResponseDto' } }, total: { type: 'number' } } } })
  async findAll(
    @Req() req: Request,
    @Query() paginationDto: UserPaginationDto,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    this.logger.info('UserController', 'findAll received', req.meta, { query: paginationDto });
    const result = await this.userService.findAll(paginationDto.skip, paginationDto.take, req.meta);
    this.logger.info('UserController', 'findAll response', req.meta, { total: result.total });
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiResponse({ status: 200, schema: { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/UserResponseDto' } }, total: { type: 'number' } } } })
  async search(
    @Req() req: Request,
    @Query() searchDto: UserSearchDto,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    this.logger.info('UserController', 'search received', req.meta, { query: searchDto });
    const result = await this.userService.search(searchDto.query, searchDto.skip, searchDto.take, req.meta);
    this.logger.info('UserController', 'search response', req.meta, { total: result.total });
    return result;
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List soft-deleted users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async getDeletedUsers(@Req() req: Request): Promise<UserResponseDto[]> {
    this.logger.info('UserController', 'getDeletedUsers received', req.meta);
    const result = await this.userService.getDeletedUsers(req.meta);
    this.logger.info('UserController', 'getDeletedUsers response', req.meta, { count: result.length });
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'findOne received', req.meta, { id });
    const result = await this.userService.findOne(id, req.meta);
    this.logger.info('UserController', 'findOne response', req.meta, { result });
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.info('UserController', 'update received', req.meta, { id, body: updateUserDto });
    const result = await this.userService.update(id, updateUserDto, req.meta);
    this.logger.info('UserController', 'update response', req.meta, { result });
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async remove(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'remove received', req.meta, { id });
    const result = await this.userService.remove(id, req.meta);
    this.logger.info('UserController', 'remove response', req.meta, { result });
    return result;
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async hardDelete(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'hardDelete received', req.meta, { id });
    const result = await this.userService.hardDelete(id, req.meta);
    this.logger.info('UserController', 'hardDelete response', req.meta, { result });
    return result;
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async restore(@Req() req: Request, @Param('id') id: string): Promise<UserResponseDto> {
    this.logger.info('UserController', 'restore received', req.meta, { id });
    const result = await this.userService.restore(id, req.meta);
    this.logger.info('UserController', 'restore response', req.meta, { result });
    return result;
  }
}
