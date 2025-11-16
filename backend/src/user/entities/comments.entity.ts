/**
 * 댓글 엔티티
 * 데이터베이스의 comments 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 댓글 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 게시글, 사용자와의 관계 및 대댓글 기능 정의
 * - 타입 안전성: TypeScript로 댓글 데이터의 타입 보장
 */

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

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
@Entity({ name: 'comments' })
export class Comment {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 댓글 내용
  // 'text' 타입: 긴 텍스트를 저장할 수 있음
  @Column('text')
  text: string;

  // ManyToOne 관계: 여러 댓글은 한 게시글에 속함
  // onDelete: 'CASCADE' - 게시글이 삭제되면 해당 게시글의 댓글도 자동 삭제
  // 왜 CASCADE인가? 게시글이 삭제되면 댓글도 의미가 없어지므로
  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  // @Index() - postId로 조회하는 경우가 많으므로 인덱스 생성
  @Index()
  post: Post;

  // 게시글 ID (외래 키)
  // 왜 별도로 저장하나? 관계 조회 없이 빠르게 조회하기 위해
  @Column()
  postId: number;

  // ManyToOne 관계: 여러 댓글은 한 사용자에 속함
  // onDelete: 'CASCADE' - 사용자가 삭제되면 해당 사용자의 댓글도 자동 삭제
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  // 작성자 ID (외래 키)
  @Column()
  userId: number;

  // ManyToOne 관계: 대댓글 기능 (자기 참조)
  // nullable: true - 일반 댓글은 parentId가 null, 대댓글은 부모 댓글 ID
  // 왜 자기 참조인가? 댓글에 댓글을 달 수 있는 대댓글 기능을 구현하기 위해
  @ManyToOne(() => Comment, (comment) => comment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  // 부모 댓글 ID (대댓글인 경우)
  // nullable: true - 일반 댓글은 null, 대댓글은 부모 댓글 ID
  @Column({ nullable: true })
  @Index()
  parentId: number;

  // OneToMany 관계: 한 댓글은 여러 대댓글을 가질 수 있음
  // 왜 필요한가? 댓글의 대댓글 목록을 쉽게 조회하기 위해
  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  // 생성일시: 댓글이 작성된 시간
  // CreateDateColumn: TypeORM이 자동으로 생성 시간 저장
  @CreateDateColumn()
  createdAt: Date;

  // 좋아요 수: 댓글에 좋아요를 누른 횟수
  // default: 0 - 기본값 0으로 설정
  // 왜 필요한가? 인기 댓글을 파악하기 위해
  @Column({ default: 0 })
  likes: number;

  // 좋아요를 누른 사용자 ID 배열
  // 'simple-array': TypeORM이 배열을 쉼표로 구분된 문자열로 저장
  // nullable: true - 좋아요가 없으면 null
  // 왜 배열로 저장하나? 중복 좋아요 방지 및 좋아요 취소 기능을 위해
  @Column('simple-array', { nullable: true })
  likedUserIds: number[];
}
