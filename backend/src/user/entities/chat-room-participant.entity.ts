

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

@Entity({ name: 'chat_room_participants' })
@Unique(['roomId', 'userId']) 
export class ChatRoomParticipant {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoom, (room) => room.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'roomId' })
  @Index()
  room: ChatRoom;

  @Column({ length: 50 })
  roomId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ nullable: true })
  lastReadAt: Date;
}

