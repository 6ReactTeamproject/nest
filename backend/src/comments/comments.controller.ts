import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from 'src/user/entities/comments.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    if (!keyword || keyword.trim() === '') {
      return { message: '검색어를 입력하세요.' };
    }
    const comments = await this.commentsService.search(keyword);
    return {
      message: '잘됨',
      data: comments,
    };
  }

  @Get('all')
  async getAll(): Promise<Comment[]> {
    return await this.commentsService.getAll();
  }

  @Get('info')
  // 이름 바꿔야함
  async qq() {
    const result = await this.commentsService.qq();
    return {
      message: 'Comments의 기본',
      data: result,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Comment> {
    return await this.commentsService.getOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Comment>): Promise<Comment> {
    return await this.commentsService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<Comment>,
  ): Promise<Comment> {
    return await this.commentsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.commentsService.remove(id);
    return { message: `Comment with id ${id} deleted.` };
  }
}
