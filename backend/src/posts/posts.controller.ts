import {
  Controller,
  Get,
  Post as PostMethod,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from 'src/user/entities/posts.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('all')
  async getAll(): Promise<PostEntity[]> {
    return await this.postsService.getAll();
  }

  @Get('info')
  async rr() {
    const result = await this.postsService.rr();
    return {
      message: 'Posts의 기본',
      data: result,
    };
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    if (!keyword || keyword.trim() === '') {
      return { message: '검색어를 입력하세요.' };
    }
    const posts = await this.postsService.search(keyword);
    return {
      message: '검색 결과입니다.',
      data: posts,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<PostEntity> {
    return await this.postsService.getOne(id);
  }

  @PostMethod()
  async create(@Body() data: Partial<PostEntity>): Promise<PostEntity> {
    return await this.postsService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<PostEntity>,
  ): Promise<PostEntity> {
    return await this.postsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.postsService.remove(id);
    return { message: `Post with id ${id} deleted.` };
  }
}
