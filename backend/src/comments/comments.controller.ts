import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { Comment } from 'src/user/entities/comments.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('댓글')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // postId로 댓글 조회
  @Get()
  async getByPostId(@Query('postId') postId: number): Promise<Comment[]> {
    if (!postId) {
      return [];
    }
    return await this.commentsService.getByPostId(Number(postId));
  }

  @ApiOperation({ summary: '댓글 작성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '댓글 작성 성공' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Comment> {
    return await this.commentsService.create({ ...createCommentDto, userId: user.userId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Comment> {
    return await this.commentsService.update(id, updateCommentDto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: { userId: number; loginId: string }) {
    await this.commentsService.remove(id, user.userId);
    return { message: `Comment with id ${id} deleted.` };
  }

  @ApiOperation({ summary: '댓글 좋아요 토글' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '좋아요 토글 성공' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/like')
  async toggleLike(
    @Param('id') id: number,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Comment> {
    return await this.commentsService.toggleLike(id, user.userId);
  }
}
