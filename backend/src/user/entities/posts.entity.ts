import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
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

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
