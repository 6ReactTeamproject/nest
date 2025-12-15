import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { Member } from 'src/user/entities/members.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@ApiTags('멤버 소개')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(): Promise<Member[]> {
    return this.membersService.findAll();
  }

  @Get('info')
  async getInfo() {
    const result = await this.membersService.getBasicInfo();
    return {
      message: 'Member의 기본 정보',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Member> {
    return this.membersService.findOne(id);
  }

  @ApiOperation({ summary: '멤버 소개 생성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '멤버 소개 생성 성공' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createMemberDto: CreateMemberDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Member> {
    return this.membersService.create({
      ...createMemberDto,
      userId: user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMemberDto: UpdateMemberDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Member> {
    return this.membersService.update(id, updateMemberDto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: { userId: number; loginId: string }): Promise<void> {
    return this.membersService.remove(id, user.userId);
  }
}
