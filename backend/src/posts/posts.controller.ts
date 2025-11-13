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

  // 모든 게시글
  @Get('all')
  async getAll(): Promise<PostEntity[]> {
    return await this.postsService.getAll();
  }

  // 게시글 정보 (프론트에서 주로 사용하는 기본 fetch용)
  @Get('info')
  async getInfo() {
    const result = await this.postsService.rr(); // postsService 내부 함수 이름 rr 유지
    return {
      message: 'Posts의 기본',
      data: result,
    };
  }

  // 검색
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

  // 단일 게시글
  @Get(':id')
  async getOne(@Param('id') id: number): Promise<PostEntity> {
    return await this.postsService.getOne(id);
  }

  // 게시글 작성
  @PostMethod()
  async create(@Body() data: Partial<PostEntity>): Promise<PostEntity> {
    return await this.postsService.create(data);
  }

  // 게시글 수정
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<PostEntity>,
  ): Promise<PostEntity> {
    return await this.postsService.update(id, data);
  }

  // 게시글 삭제
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.postsService.remove(id);
    return { message: `Post with id ${id} deleted.` };
  }
}
