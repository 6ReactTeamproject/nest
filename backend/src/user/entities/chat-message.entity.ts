/**
 * 채팅 메시지 엔티티
 * 데이터베이스의 chat_messages 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 채팅 메시지 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 채팅방, 사용자와의 관계 정의
 * - 타입 안전성: TypeScript로 채팅 메시지 데이터의 타입 보장
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
import { ChatRoom } from './chat-room.entity';

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
@Entity({ name: 'chat_messages' })
export class ChatMessage {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // ManyToOne 관계: 여러 메시지는 한 채팅방에 속함
  // onDelete: 'CASCADE' - 채팅방이 삭제되면 해당 방의 메시지도 자동 삭제
  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'roomId' })
  @Index()
  room: ChatRoom;

  // 방 ID (외래 키 - roomId로 참조)
  @Column({ length: 50 })
  roomId: string;

  // ManyToOne 관계: 여러 메시지는 한 사용자에 속함
  // onDelete: 'CASCADE' - 사용자가 삭제되면 해당 사용자의 메시지도 자동 삭제
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  // 작성자 ID (외래 키)
  @Column()
  userId: number;

  // 메시지 내용
  // 'text' 타입: 긴 텍스트를 저장할 수 있음
  @Column('text')
  message: string;

  // 생성일시: 메시지가 작성된 시간
  // CreateDateColumn: TypeORM이 자동으로 생성 시간 저장
  @CreateDateColumn()
  @Index()
  createdAt: Date;
}

