import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  // [수정] user.sentMessages를 참조
  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: number;

  // [수정] user.receivedMessages를 참조
  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;
}
