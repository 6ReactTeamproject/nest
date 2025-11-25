/**
 * 채팅방 참여자 엔티티
 * 데이터베이스의 chat_room_participants 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 채팅방 참여자 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 채팅방, 사용자와의 관계 정의
 * - 읽음 상태 추적: 사용자가 마지막으로 읽은 메시지 시간 추적
 * - 타입 안전성: TypeScript로 참여자 데이터의 타입 보장
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { ChatRoom } from './chat-room.entity';

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
@Entity({ name: 'chat_room_participants' })
@Unique(['roomId', 'userId']) // 같은 사용자가 같은 방에 중복 참여 불가
export class ChatRoomParticipant {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // ManyToOne 관계: 여러 참여자는 한 채팅방에 속함
  // onDelete: 'CASCADE' - 채팅방이 삭제되면 해당 방의 참여자 정보도 자동 삭제
  @ManyToOne(() => ChatRoom, (room) => room.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'roomId' })
  @Index()
  room: ChatRoom;

  // 방 ID (외래 키 - roomId로 참조)
  @Column({ length: 50 })
  roomId: string;

  // ManyToOne 관계: 여러 참여자는 한 사용자에 속함
  // onDelete: 'CASCADE' - 사용자가 삭제되면 해당 사용자의 참여 정보도 자동 삭제
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  // 사용자 ID (외래 키)
  @Column()
  userId: number;

  // 참여일시: 사용자가 방에 참여한 시간
  // CreateDateColumn: TypeORM이 자동으로 생성 시간 저장
  @CreateDateColumn()
  joinedAt: Date;

  // 마지막 읽은 시간: 사용자가 마지막으로 메시지를 읽은 시간
  // nullable: true - 아직 읽지 않았으면 null
  // 왜 필요한가? 읽지 않은 메시지 수를 계산하기 위해
  @Column({ nullable: true })
  lastReadAt: Date;
}

