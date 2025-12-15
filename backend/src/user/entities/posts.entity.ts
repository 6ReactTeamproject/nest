

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comments.entity';

@Entity({ name: 'posts' })
export class Post {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  
  @Index()
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];
}
