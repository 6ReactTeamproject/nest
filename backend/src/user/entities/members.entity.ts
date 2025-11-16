/**
 * 멤버 소개 엔티티
 * 데이터베이스의 members 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 멤버 소개 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 사용자와의 OneToOne 관계 정의
 * - 타입 안전성: TypeScript로 멤버 소개 데이터의 타입 보장
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
@Entity({ name: 'members' })
export class Member {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // OneToOne 관계: 한 사용자는 하나의 멤버 소개만 가질 수 있음
  // onDelete: 'CASCADE' - 사용자가 삭제되면 해당 사용자의 멤버 소개도 자동 삭제
  // 왜 OneToOne인가? 한 사용자는 하나의 멤버 소개만 작성할 수 있으므로
  @OneToOne(() => User, (user) => user.memberProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  // @Index() - user_id로 조회하는 경우가 많으므로 인덱스 생성
  @Index()
  user: User;

  // 사용자 ID (외래 키)
  // 왜 별도로 저장하나? 관계 조회 없이 빠르게 조회하기 위해
  @Column({ name: 'user_id' })
  user_id: number;

  // 멤버 이름
  @Column()
  name: string;

  // 멤버 소개 내용
  // 'text' 타입: 긴 텍스트를 저장할 수 있음
  @Column('text')
  introduction: string;

  // 멤버 이미지 URL (선택적)
  // nullable: true - 이미지가 없는 멤버 소개도 가능
  @Column({ nullable: true })
  imageUrl: string;
}
