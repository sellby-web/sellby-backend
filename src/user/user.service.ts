import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(
    skip?: number,
    take?: number,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isDeleted: false },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { isDeleted: false } }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async search(
    query: string,
    skip?: number,
    take?: number,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          isDeleted: false,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          isDeleted: false,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { data, total };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto, updatedAt: new Date() },
    });
  }

  async remove(id: string): Promise<UserResponseDto> {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isDeleted: true, updatedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<UserResponseDto> {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async restore(id: string): Promise<UserResponseDto> {
    return this.prisma.user.update({
      where: { id },
      data: { isDeleted: false, updatedAt: new Date() },
    });
  }

  async getDeletedUsers(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany({
      where: { isDeleted: true },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
