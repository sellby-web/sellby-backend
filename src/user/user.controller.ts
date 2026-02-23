import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { UserSearchDto } from './dto/user-search.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() paginationDto: UserPaginationDto) {
    return this.userService.findAll(paginationDto.skip, paginationDto.take);
  }

  @Get('search')
  search(@Query() searchDto: UserSearchDto) {
    return this.userService.search(
      searchDto.query,
      searchDto.skip,
      searchDto.take,
    );
  }

  @Get('deleted')
  getDeletedUsers() {
    return this.userService.getDeletedUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id') id: string) {
    return this.userService.hardDelete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }
}
