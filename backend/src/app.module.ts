/**
 * 루트 모듈
 * NestJS 애플리케이션의 루트 모듈로, 모든 기능 모듈을 통합합니다.
 * 
 * 왜 필요한가?
 * - 모듈 통합: 모든 기능 모듈을 한 곳에서 관리
 * - 전역 설정: 데이터베이스 연결, 환경 변수 등 전역 설정
 * - 의존성 주입: 모든 모듈이 사용할 수 있는 전역 서비스 제공
 */

import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { SemesterModule } from './semester/semester.module';
import { CommentsModule } from './comments/comments.module';
import { MembersModule } from './members/members.module';
import { MessageModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule: 환경 변수 관리
    // isGlobal: true - 모든 모듈에서 ConfigService를 사용할 수 있게 함
    // 왜 전역으로 설정하나? 여러 모듈에서 환경 변수를 사용하므로
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // TypeOrmModule: 데이터베이스 연결 설정
    // forRoot: 루트 레벨에서 데이터베이스 연결 설정
    TypeOrmModule.forRoot({
      type: 'mysql', // 데이터베이스 타입: MySQL
      host: 'db', // 데이터베이스 호스트 (Docker 컨테이너 이름)
      port: 3306, // MySQL 기본 포트
      username: 'user', // 데이터베이스 사용자명
      password: '1234', // 데이터베이스 비밀번호
      database: 'db', // 데이터베이스 이름
      charset: 'utf8mb4', // 문자셋: 한글, 이모지 등 4바이트 문자 지원
      // entities: 엔티티 파일 경로 (자동으로 모든 엔티티 로드)
      // 왜 이렇게 하나? 엔티티를 자동으로 찾아서 로드하기 위해
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize: false - seed.sql에서 테이블을 생성하므로 자동 동기화 비활성화
      // 왜 false인가? seed.sql이 먼저 실행되어 테이블을 생성하고, TypeORM과 충돌을 방지하기 위해
      // 주의: 엔티티 변경 시 seed.sql도 함께 수정해야 함
      synchronize: false,
      extra: {
        charset: 'utf8mb4', // 연결 레벨에서도 문자셋 설정
        connectionLimit: 10, // 최대 연결 수 제한
      },
      logging: false, // SQL 쿼리 로깅 비활성화 (개발 시 true로 설정 가능)
    }),
    
    // 기능 모듈들: 각 기능별 모듈을 import
    // 왜 필요한가? 각 기능을 독립적인 모듈로 분리하여 코드 구조화
    PostsModule,      // 게시글 모듈
    UserModule,       // 사용자 모듈
    SemesterModule,   // 여행지 소개 모듈
    CommentsModule,   // 댓글 모듈
    MembersModule,    // 멤버 소개 모듈
    MessageModule,    // 쪽지 모듈
    AuthModule,       // 인증 모듈
  ],
})
export class AppModule {}
