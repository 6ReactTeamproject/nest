/**
 * 파일 업로드 서비스
 * 이미지 파일을 저장하고 관리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 파일 저장: 업로드된 이미지를 서버에 저장
 * - 파일명 생성: 중복 방지를 위한 고유 파일명 생성
 * - 파일 검증: 이미지 파일만 허용하고 크기 제한
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  // 업로드 디렉토리 경로
  // 왜 절대 경로를 사용하나? Docker 환경에서도 정확한 경로를 보장하기 위해
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    // 업로드 디렉토리가 없으면 생성
    // 왜 필요한가? 서버 시작 시 디렉토리가 없으면 파일 저장 실패
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * 파일 저장
   * 업로드된 파일을 서버에 저장하고 파일 경로를 반환합니다.
   * 
   * @param file 업로드된 파일 객체
   * @returns 저장된 파일의 경로 (예: /uploads/uuid-filename.jpg)
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    // 파일 타입 검증: 이미지 파일만 허용
    // 왜 필요한가? 악성 파일 업로드를 방지하기 위해
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('이미지 파일만 업로드 가능합니다.');
    }

    // 파일 크기 제한: 5MB
    // 왜 필요한가? 서버 저장 공간을 보호하고 성능을 유지하기 위해
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('파일 크기는 5MB 이하여야 합니다.');
    }

    // 고유 파일명 생성: UUID + 원본 파일명
    // 왜 UUID를 사용하나? 파일명 중복을 방지하고 보안을 강화하기 위해
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    // 파일 저장
    // 왜 동기식으로 하나? 파일 저장이 완료된 후 경로를 반환해야 하므로
    fs.writeFileSync(filePath, file.buffer);

    // 웹에서 접근 가능한 경로 반환
    // 왜 /uploads/로 시작하나? 정적 파일 서빙 경로와 일치시켜야 하므로
    return `/uploads/${fileName}`;
  }

  /**
   * 파일 삭제
   * 서버에서 파일을 삭제합니다.
   * 
   * @param filePath 삭제할 파일 경로 (예: /uploads/uuid-filename.jpg)
   */
  async deleteFile(filePath: string): Promise<void> {
    // 경로에서 파일명 추출
    const fileName = path.basename(filePath);
    const fullPath = path.join(this.uploadPath, fileName);

    // 파일이 존재하면 삭제
    // 왜 try-catch를 사용하나? 파일이 없어도 에러를 던지지 않기 위해
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      // 파일 삭제 실패는 무시 (이미 삭제되었거나 없는 경우)
      console.error('파일 삭제 실패:', error);
    }
  }
}

