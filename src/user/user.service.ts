import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AppLogger, RequestMeta } from 'src/common/logger/app-logger';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  async create(createUserDto: CreateUserDto, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('UserService', 'create called', meta, { email: createUserDto.email });
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
    });

    const { password, ...userWithoutPassword } = user;
    const result = userWithoutPassword as UserResponseDto;
    this.logger.info('UserService', 'create done', meta, { userId: result.id });
    return result;
  }

  async findAll(
    skip?: number,
    take?: number,
    meta?: RequestMeta,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    this.logger.info('UserService', 'findAll called', meta, { skip, take });
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isDeleted: false },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { isDeleted: false } }),
    ]);
    this.logger.info('UserService', 'findAll done', meta, { total });
    return { data, total };
  }

  async findOne(id: string, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('UserService', 'findOne called', meta, { id });
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.logger.info('UserService', 'findOne done', meta, { userId: user.id });
    return user;
  }

  async findByEmail(email: string, meta?: RequestMeta): Promise<UserResponseDto | null> {
    this.logger.info('UserService', 'findByEmail called', meta, { email });
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponseDto;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async search(
    query: string,
    skip?: number,
    take?: number,
    meta?: RequestMeta,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    this.logger.info('UserService', 'search called', meta, { query, skip, take });
    const where = {
      isDeleted: false,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ],
    };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);
    this.logger.info('UserService', 'search done', meta, { total });
    return { data, total };
  }

  async update(id: string, updateUserDto: UpdateUserDto, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('UserService', 'update called', meta, { id });
    await this.findOne(id, meta);
    const result = await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto, updatedAt: new Date() },
    });
    this.logger.info('UserService', 'update done', meta, { userId: id });
    return result;
  }

  async remove(id: string, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('UserService', 'remove called', meta, { id });
    await this.findOne(id, meta);
    const result = await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true, updatedAt: new Date() },
    });
    this.logger.info('UserService', 'remove done', meta, { userId: id });
    return result;
  }

  async hardDelete(id: string, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('UserService', 'hardDelete called', meta, { id });
    await this.findOne(id, meta);
    const result = await this.prisma.user.delete({ where: { id } });
    this.logger.info('UserService', 'hardDelete done', meta, { userId: id });
    return result;
  }

  async restore(id: string, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('UserService', 'restore called', meta, { id });
    const result = await this.prisma.user.update({
      where: { id },
      data: { isDeleted: false, updatedAt: new Date() },
    });
    this.logger.info('UserService', 'restore done', meta, { userId: id });
    return result;
  }

  async getDeletedUsers(meta?: RequestMeta): Promise<UserResponseDto[]> {
    this.logger.info('UserService', 'getDeletedUsers called', meta);
    const result = await this.prisma.user.findMany({
      where: { isDeleted: true },
      orderBy: { updatedAt: 'desc' },
    });
    this.logger.info('UserService', 'getDeletedUsers done', meta, { count: result.length });
    return result;
  }
}
