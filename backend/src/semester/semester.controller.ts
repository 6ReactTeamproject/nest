/**
 * 여행지 소개 컨트롤러
 * 여행지 소개(학기 소개) 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * 
 * 왜 필요한가?
 * - API 엔드포인트 제공: 여행지 소개 조회, 작성, 수정, 삭제 기능 제공
 * - 인증 처리: JWT 가드를 사용하여 인증된 사용자만 작성/수정/삭제 가능
 * - 권한 검증: 작성자 본인만 수정/삭제 가능하도록 보안 강화
 * - Swagger 문서화: API 문서 자동 생성
 */

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

  /**
   * 전체 여행지 소개 조회
   * 모든 여행지 소개를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 여행지 목록 표시: 여행지 소개 페이지에서 모든 여행지를 보여주기 위해
   * - 공개 API: 인증 없이도 조회 가능 (모든 사용자가 여행지 소개를 볼 수 있음)
   * 
   * @returns 여행지 소개 배열
   */
  @Get('all')
  async getAll(): Promise<Semester[]> {
    return await this.semesterService.getAll();
  }

  /**
   * 여행지 기본 정보 조회
   * 여행지의 기본 정보만 가져옵니다 (성능 최적화용).
   * 
   * 왜 필요한가?
   * - 성능 최적화: 필요한 필드만 선택하여 조회 성능 향상
   * - 프론트엔드 최적화: 프론트엔드에서 주로 사용하는 필드만 반환
   * 
   * @returns 여행지 기본 정보 배열
   */
  @Get('info')
  async getInfo() {
    const result = await this.semesterService.getBasicInfo();
    return {
      message: 'Semester의 기본 정보',
      data: result,
    };
  }

  /**
   * 단일 여행지 소개 조회
   * 특정 여행지 소개의 상세 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 여행지 상세 표시: 여행지 상세 페이지에서 전체 내용을 보여주기 위해
   * - 공개 API: 인증 없이도 조회 가능
   * 
   * @param id 여행지 ID
   * @returns 여행지 소개 정보
   */
  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Semester> {
    return await this.semesterService.getOne(id);
  }

  /**
   * 여행지 소개 생성
   * 새로운 여행지 소개를 작성합니다.
   * 
   * 왜 필요한가?
   * - 여행지 소개 작성 기능: 사용자가 여행지 소개를 작성할 수 있게 함
   * - 인증 필요: 로그인한 사용자만 작성 가능
   * - 자동 작성자 정보: JWT에서 사용자 ID를 추출하여 자동으로 설정
   * 
   * @param createSemesterDto 여행지 소개 작성 데이터 (제목, 설명, 이미지)
   * @param user 현재 로그인한 사용자 정보 (JWT에서 추출)
   * @returns 생성된 여행지 소개
   */
  @ApiOperation({ summary: '여행지 소개 생성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '여행지 소개 생성 성공' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSemesterDto: CreateSemesterDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Semester> {
    // 스프레드 연산자로 DTO와 authorId를 병합하여 서비스에 전달
    // 왜 이렇게 하나? 클라이언트가 authorId를 보내면 안 되므로 서버에서 설정
    return await this.semesterService.create({
      ...createSemesterDto,
      authorId: user.userId,
    });
  }

  /**
   * 여행지 소개 수정
   * 기존 여행지 소개를 수정합니다.
   * 
   * 왜 필요한가?
   * - 여행지 소개 수정 기능: 사용자가 작성한 여행지 소개를 수정할 수 있게 함
   * - 권한 검증: 작성자 본인만 수정 가능 (서비스에서 처리)
   * - 인증 필요: 로그인한 사용자만 수정 가능
   * 
   * @param id 여행지 ID
   * @param updateSemesterDto 수정할 여행지 소개 데이터
   * @param user 현재 로그인한 사용자 정보
   * @returns 수정된 여행지 소개
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSemesterDto: UpdateSemesterDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Semester> {
    return await this.semesterService.update(id, updateSemesterDto, user.userId);
  }

  /**
   * 여행지 소개 삭제
   * 여행지 소개를 삭제합니다.
   * 
   * 왜 필요한가?
   * - 여행지 소개 삭제 기능: 사용자가 작성한 여행지 소개를 삭제할 수 있게 함
   * - 권한 검증: 작성자 본인만 삭제 가능 (서비스에서 처리)
   * - 인증 필요: 로그인한 사용자만 삭제 가능
   * 
   * @param id 여행지 ID
   * @param user 현재 로그인한 사용자 정보
   * @returns 삭제 성공 메시지
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: { userId: number; loginId: string }) {
    await this.semesterService.remove(id, user.userId);
    return { message: `Semester with id deleted.` };
  }
}
