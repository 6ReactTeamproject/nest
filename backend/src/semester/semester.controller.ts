

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
import { SemesterService } from './semester.service';
import { Semester } from 'src/user/entities/semester.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@ApiTags('여행지 소개')
@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get('all')
  async getAll(): Promise<Semester[]> {
    return await this.semesterService.getAll();
  }

  @Get('info')
  async getInfo() {
    const result = await this.semesterService.getBasicInfo();
    return {
      message: 'Semester의 기본 정보',
      data: result,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Semester> {
    return await this.semesterService.getOne(id);
  }

  @ApiOperation({ summary: '여행지 소개 생성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '여행지 소개 생성 성공' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSemesterDto: CreateSemesterDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Semester> {

    return await this.semesterService.create({
      ...createSemesterDto,
      authorId: user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSemesterDto: UpdateSemesterDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Semester> {
    return await this.semesterService.update(id, updateSemesterDto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: { userId: number; loginId: string }) {
    await this.semesterService.remove(id, user.userId);
    return { message: `Semester with id deleted.` };
  }
}
