/**
 * 채팅방 엔티티
 * 데이터베이스의 chat_rooms 테이블과 매핑되는 엔티티입니다.
 *
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 채팅방 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 생성자와의 관계 정의
 * - 타입 안전성: TypeScript로 채팅방 데이터의 타입 보장
 */

import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';
import { ChatRoomParticipant } from './chat-room-participant.entity';

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
@Entity({ name: 'chat_rooms' })
export class ChatRoom {
  // 방 ID: 고유한 방 식별자 (예: 'general', 'travel')
  // PRIMARY KEY로 사용 (다른 테이블에서 외래 키로 참조)
  @PrimaryColumn({ length: 50 })
  roomId: string;

  // 방 이름
  @Column()
  name: string;

  // 방 설명 (선택적)
  @Column('text', { nullable: true })
  description: string | null;

  // ManyToOne 관계: 여러 채팅방은 한 생성자에 속함
  // onDelete: 'CASCADE' - 생성자가 삭제되면 해당 사용자가 만든 채팅방도 자동 삭제
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdBy' })
  @Index()
  creator: User;

  // 생성자 ID (외래 키)
  @Column()
  createdBy: number;

  // 생성일시: 채팅방이 생성된 시간
  @CreateDateColumn()
  createdAt: Date;

  // 수정일시: 채팅방 정보가 수정된 시간
  @UpdateDateColumn()
  updatedAt: Date;

  // OneToMany 관계: 한 채팅방은 여러 메시지를 가질 수 있음
  @OneToMany(() => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

  // OneToMany 관계: 한 채팅방은 여러 참여자를 가질 수 있음
  @OneToMany(() => ChatRoomParticipant, (participant) => participant.room)
  participants: ChatRoomParticipant[];
}
