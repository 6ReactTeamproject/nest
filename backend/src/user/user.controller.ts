import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('사용자')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  async getAll(): Promise<User[]> {
    return await this.userService.getAll();
  }

  @Get('info')
  async getInfo() {
    const result = await this.userService.getBasicInfo();
    return {
      message: 'User 기본',
      data: result,
    };
  }

  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '사용자 정보 수정 성공' })
  @ApiResponse({ status: 403, description: '본인의 정보만 수정 가능' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: { userId: number; loginId: string },
  ) {
    const userId = Number(id);
    if (user.userId !== userId) {
      throw new ForbiddenException('본인의 정보만 수정할 수 있습니다.');
    }
    return await this.userService.update(userId, updateUserDto);
  }

}
