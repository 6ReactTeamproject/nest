/**
 * 여행지 소개 엔티티
 * 데이터베이스의 semester 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 여행지 소개 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 작성자와의 관계 정의
 * - 타입 안전성: TypeScript로 여행지 소개 데이터의 타입 보장
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
@Entity({ name: 'semester' })
export class Semester {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // ManyToOne 관계: 여러 여행지 소개는 한 작성자에 속함
  // onDelete: 'CASCADE' - 작성자가 삭제되면 해당 사용자의 여행지 소개도 자동 삭제
  @ManyToOne(() => User, (user) => user.semesters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  // @Index() - authorId로 조회하는 경우가 많으므로 인덱스 생성
  @Index()
  author: User;

  // 작성자 ID (외래 키)
  // 왜 별도로 저장하나? 관계 조회 없이 빠르게 조회하기 위해
  @Column()
  authorId: number;

  // 여행지 제목
  @Column()
  title: string;

  // 여행지 설명
  // 'text' 타입: 긴 텍스트를 저장할 수 있음
  @Column('text')
  description: string;

  // 여행지 이미지 URL (선택적)
  // nullable: true - 이미지가 없는 여행지 소개도 가능
  @Column({ nullable: true })
  imageUrl: string;

  // 생성일시: 여행지 소개가 작성된 시간
  // CreateDateColumn: TypeORM이 자동으로 생성 시간 저장
  @CreateDateColumn()
  createdAt: Date;
}
