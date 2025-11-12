import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './posts.entity';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  // parent comment
  @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ nullable: true })
  parentId: number;

  // child comments
  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: 0 })
  likes: number;

  @Column('simple-array', { nullable: true })
  likedUserIds: number[];
}
