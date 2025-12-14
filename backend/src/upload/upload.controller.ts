/**
 * 파일 업로드 컨트롤러
 * 이미지 파일 업로드를 처리하는 엔드포인트를 제공합니다.
 * 
 * 왜 필요한가?
 * - 파일 업로드 API: 프론트엔드에서 이미지를 업로드할 수 있는 엔드포인트 제공
 * - 인증 필요: 로그인한 사용자만 파일 업로드 가능
 * - 단일 파일 업로드: 게시글 이미지, 프로필 이미지 등에 사용
 */

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@ApiTags('파일 업로드')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 이미지 파일 업로드
   * 단일 이미지 파일을 업로드하고 파일 경로를 반환합니다.
   * 
   * 왜 필요한가?
   * - 이미지 업로드: 게시글, 프로필 등에 이미지를 첨부할 수 있게 함
   * - 경로 반환: 업로드된 파일의 경로를 반환하여 DB에 저장할 수 있게 함
   * 
   * @param file 업로드된 이미지 파일
   * @returns 업로드된 파일의 경로
   */
  @ApiOperation({ summary: '이미지 파일 업로드' })
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // 파일이 없으면 에러
    // 왜 필요한가? 파일 없이 요청이 오면 에러를 명확히 알려주기 위해
    if (!file) {
      throw new BadRequestException('파일이 필요합니다.');
    }

    // 파일 저장 및 경로 반환
    const filePath = await this.uploadService.saveFile(file);
    
    return {
      success: true,
      path: filePath, // 예: /uploads/uuid-filename.jpg
      message: '파일이 성공적으로 업로드되었습니다.',
    };
  }
}

