/**
 * NestJS 애플리케이션 진입점
 * 애플리케이션을 초기화하고 전역 설정을 적용합니다.
 * 
 * 왜 필요한가?
 * - 애플리케이션 부트스트랩: NestJS 앱을 생성하고 시작
 * - CORS 설정: 프론트엔드와의 통신을 위한 CORS 활성화
 * - 전역 파이프 설정: 모든 요청에 대한 데이터 검증
 * - 전역 필터 설정: 모든 예외를 일관된 형식으로 처리
 * - Swagger 설정: API 문서 자동 생성
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

/**
 * 애플리케이션 부트스트랩 함수
 * NestJS 애플리케이션을 생성하고 설정한 후 서버를 시작합니다.
 * 
 * 왜 필요한가?
 * - 애플리케이션 초기화: NestJS 앱 인스턴스 생성
 * - 전역 설정 적용: CORS, Validation, Exception Filter 등 설정
 * - 서버 시작: 지정된 포트에서 HTTP 서버 시작
 */
async function bootstrap() {
  // 업로드 디렉토리 생성 (서버 시작 시 자동 생성)
  // 왜 필요한가? 다른 팀원이 코드를 받았을 때 uploads 폴더가 없어도 자동으로 생성되도록
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ uploads 폴더가 자동으로 생성되었습니다.');
  }
  
  // NestJS 애플리케이션 인스턴스 생성
  // NestExpressApplication: Express 플랫폼을 사용하여 정적 파일 서빙 가능
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 정적 파일 서빙 설정: uploads 폴더를 /uploads 경로로 서빙
  // 왜 필요한가? 업로드된 이미지 파일을 웹에서 접근할 수 있게 하기 위해
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // /uploads 경로로 접근 가능
  });
  
  // CORS (Cross-Origin Resource Sharing) 활성화
  // 왜 필요한가? 프론트엔드와 백엔드가 다른 포트에서 실행되므로 CORS 필요
  app.enableCors({
    origin: true, // 모든 origin 허용 (프로덕션에서는 특정 origin만 허용해야 함)
    credentials: true, // 쿠키와 인증 정보를 포함한 요청 허용
  });
  
  // 응답 헤더에 charset 설정 (JSON 응답에만 적용)
  // 왜 필요한가? 한글 등 UTF-8 문자가 올바르게 표시되도록 하기 위해
  app.use((req, res, next) => {
    // 정적 파일 요청이 아닌 경우에만 JSON 헤더 설정
    if (!req.path.startsWith('/uploads')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    next();
  });
  
  // 전역 예외 필터 설정
  // 왜 필요한가? 모든 HTTP 예외를 일관된 형식으로 처리하여 API 응답 일관성 유지
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 전역 ValidationPipe 설정
  // 왜 필요한가? 모든 요청에 대해 DTO를 사용한 자동 데이터 검증
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거 (보안 강화)
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청 거부
      transform: true, // 요청 데이터를 DTO 인스턴스로 자동 변환
      transformOptions: {
        enableImplicitConversion: true, // 타입 자동 변환 활성화 (문자열을 숫자로 등)
      },
    }),
  );

  // Swagger 설정: API 문서 자동 생성
  // 왜 필요한가? 개발자와 프론트엔드 개발자가 API를 쉽게 이해하고 테스트할 수 있게 함
  const config = new DocumentBuilder()
    .setTitle('현지학기제 카페 API')
    .setDescription('현지학기제 카페 백엔드 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'JWT-auth', // 이 이름을 컨트롤러에서 사용 (@ApiBearerAuth('JWT-auth'))
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // '/api' 경로에서 Swagger UI 접근 가능
  SwaggerModule.setup('api', app, document);

  // 서버 시작: 지정된 포트에서 HTTP 서버 시작
  // process.env.PORT: 환경 변수에서 포트 번호 가져오기 (없으면 3000 사용)
  // 왜 환경 변수를 사용하나? 배포 환경에 따라 포트를 다르게 설정할 수 있으므로
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();