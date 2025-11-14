import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './posts.entity';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  @Index()
  post: Post;

  @Column()
  postId: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Comment, (comment) => comment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ nullable: true })
  @Index()
  parentId: number;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  likes: number;

  @Column('simple-array', { nullable: true })
  likedUserIds: number[];
}
