import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { SemesterService } from './semester.service';
import { Semester } from 'src/user/entities/semester.entity';

@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    if (!keyword || keyword.trim() === '') {
      return { message: '검색어를 입력하세요.' };
    }
    const comments = await this.semesterService.search(keyword);
    return {
      message: '잘됨',
      data: comments,
    };
  }

  @Get('all')
  async getAll(): Promise<Semester[]> {
    return await this.semesterService.getAll();
  }

  // semester.controller.ts
  @Get('info')
  async getBasicInfo() {
    const result = await this.semesterService.getBasicInfo();
    return {
      message: 'Semester의 기본 정보(id, title, description, imageUrl) 반환',
      data: result,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Semester> {
    return await this.semesterService.getOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Semester>): Promise<Semester> {
    return await this.semesterService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<Semester>,
  ): Promise<Semester> {
    return await this.semesterService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.semesterService.remove(id);
    return { message: `Semester with id deleted.` };
  }
}
