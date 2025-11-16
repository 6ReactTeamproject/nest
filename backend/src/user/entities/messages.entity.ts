/**
 * 쪽지 엔티티
 * 데이터베이스의 messages 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 쪽지 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 발신자와 수신자와의 관계 정의
 * - 타입 안전성: TypeScript로 쪽지 데이터의 타입 보장
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
@Entity({ name: 'messages' })
export class Message {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // ManyToOne 관계: 여러 쪽지는 한 발신자에 속함
  // onDelete: 'CASCADE' - 발신자가 삭제되면 해당 사용자가 보낸 쪽지도 자동 삭제
  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  // @Index() - senderId로 조회하는 경우가 많으므로 인덱스 생성
  @Index()
  sender: User;

  // 발신자 ID (외래 키)
  // 왜 별도로 저장하나? 관계 조회 없이 빠르게 조회하기 위해
  @Column()
  senderId: number;

  // ManyToOne 관계: 여러 쪽지는 한 수신자에 속함
  // onDelete: 'CASCADE' - 수신자가 삭제되면 해당 사용자가 받은 쪽지도 자동 삭제
  @ManyToOne(() => User, (user) => user.receivedMessages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiverId' })
  @Index()
  receiver: User;

  // 수신자 ID (외래 키)
  @Column()
  receiverId: number;

  // 쪽지 제목
  @Column()
  title: string;

  // 쪽지 내용
  // 'text' 타입: 긴 텍스트를 저장할 수 있음
  @Column('text')
  content: string;

  // 생성일시: 쪽지가 작성된 시간
  // CreateDateColumn: TypeORM이 자동으로 생성 시간 저장
  @CreateDateColumn()
  createdAt: Date;

  // 읽음 여부: 쪽지를 읽었는지 여부
  // default: false - 기본값 false (읽지 않음)
  // 왜 필요한가? 읽지 않은 쪽지를 구분하여 알림 기능 구현
  @Column({ default: false })
  isRead: boolean;
}
