/**
 * 파일 업로드 모듈
 * 이미지 파일 업로드를 처리하는 모듈입니다.
 * 
 * 왜 필요한가?
 * - 파일 업로드 기능: 게시글, 프로필 등에 이미지를 업로드할 수 있게 함
 * - 재사용성: 여러 모듈에서 공통으로 사용할 수 있는 업로드 기능 제공
 */

import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // 다른 모듈에서도 사용할 수 있도록 export
})
export class UploadModule {}

