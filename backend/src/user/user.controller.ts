import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 전체 조회
  @Get('all')
  async getAll(): Promise<User[]> {
    return await this.userService.getAll();
  }

  @Get('info')
  async tt() {
    const result = await this.userService.tt();
    return {
      message: 'User 기본',
      data: result,
    };
  }

  // 단일 조회
  @Get(':id')
  async getOne(@Param('id') id: number): Promise<User> {
    return await this.userService.getOne(id);
  }

  // 생성
  @Post()
  async create(@Body() data: Partial<User>): Promise<User> {
    return await this.userService.create(data);
  }

  // 수정
  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: Partial<User>) {
    return await this.userService.update(id, data);
  }

  // 삭제
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.userService.remove(id);
    return { message: `User with id ${id} deleted.` };
  }
}
