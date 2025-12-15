import {
  Controller,
  Get,
  Post as PostMethod,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { Post as PostEntity } from 'src/user/entities/posts.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('게시글')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('all')
  async getAll(@Query('userId') userId?: number): Promise<PostEntity[]> {
    if (userId) {
      return await this.postsService.getByUserId(Number(userId));
    }
    return await this.postsService.getAll();
  }

  @Get('info')
  async getInfo() {
    const result = await this.postsService.getBasicInfo();
    return {
      message: 'Posts의 기본',
      data: result,
    };
  }

  @ApiOperation({ summary: '게시글 조회수 증가' })
  @ApiResponse({ status: 200, description: '조회수 증가 성공' })
  @Patch(':id/view')
  async incrementViews(@Param('id') id: number): Promise<{ message: string }> {
    await this.postsService.incrementViews(id);
    return { message: 'Views incremented' };
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<PostEntity> {
    return await this.postsService.getOne(id);
  }

  @ApiOperation({ summary: '게시글 작성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '게시글 작성 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @UseGuards(JwtAuthGuard)
  @PostMethod()
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<PostEntity> {
    return await this.postsService.create({ ...createPostDto, userId: user.userId });
  }

  @ApiOperation({ summary: '게시글 수정' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '게시글 수정 성공' })
  @ApiResponse({ status: 403, description: '본인의 글만 수정 가능' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<PostEntity> {
    return await this.postsService.update(id, updatePostDto, user.userId);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
  @ApiResponse({ status: 403, description: '본인의 글만 삭제 가능' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: { userId: number; loginId: string }) {
    await this.postsService.remove(id, user.userId);
    return { message: `Post with id ${id} deleted.` };
  }
}
