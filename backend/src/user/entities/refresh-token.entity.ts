/**
 * 리프레시 토큰 엔티티
 * 데이터베이스의 refresh_tokens 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 리프레시 토큰 저장: 액세스 토큰 갱신을 위한 리프레시 토큰 관리
 * - 보안: 토큰을 데이터베이스에 저장하여 무효화 가능
 * - 만료 관리: 토큰 만료 시간을 추적하여 자동 삭제 가능
 * - 타입 안전성: TypeScript로 토큰 데이터의 타입 보장
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 리프레시 토큰 문자열
  // unique: true - 중복 방지 (같은 토큰이 여러 번 저장되지 않도록)
  // @Index() - 토큰으로 조회하는 경우가 많으므로 인덱스 생성
  // 왜 인덱스가 필요한가? 토큰 검증 시 빠른 조회를 위해
  @Column({ unique: true })
  @Index()
  token: string;

  // ManyToOne 관계: 여러 리프레시 토큰은 한 사용자에 속함
  // onDelete: 'CASCADE' - 사용자가 삭제되면 해당 사용자의 리프레시 토큰도 자동 삭제
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  // 사용자 ID (외래 키)
  // 왜 별도로 저장하나? 관계 조회 없이 빠르게 조회하기 위해
  @Column()
  userId: number;

  // 토큰 만료 시간: 이 시간 이후에는 토큰이 무효화됨
  // 왜 필요한가? 만료된 토큰을 자동으로 삭제하고 보안을 강화하기 위해
  @Column()
  expiresAt: Date;

  // 토큰 생성 시간: 토큰이 언제 생성되었는지 추적
  // CreateDateColumn: TypeORM이 자동으로 생성 시간 저장
  // 왜 필요한가? 토큰의 수명을 추적하고 디버깅에 유용
  @CreateDateColumn()
  createdAt: Date;
}

