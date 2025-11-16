/**
 * 게시글 엔티티
 * 데이터베이스의 posts 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 게시글 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 사용자, 댓글과의 관계 정의
 * - 타입 안전성: TypeScript로 게시글 데이터의 타입 보장
 */

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

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
@Entity({ name: 'posts' })
export class Post {
  // 기본 키: 자동 증가하는 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 게시글 제목
  @Column()
  title: string;

  // 게시글 내용
  // 'text' 타입: 긴 텍스트를 저장할 수 있음
  // 왜 text 타입인가? 게시글 내용은 길 수 있으므로 VARCHAR보다 TEXT가 적합
  @Column('text')
  content: string;

  // ManyToOne 관계: 여러 게시글은 한 사용자에 속함
  // onDelete: 'CASCADE' - 사용자가 삭제되면 해당 사용자의 게시글도 자동 삭제
  // 왜 CASCADE인가? 사용자가 삭제되면 그 사용자의 게시글도 의미가 없어지므로
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  // @Index() - userId로 조회하는 경우가 많으므로 인덱스 생성
  @Index()
  user: User;

  // 작성자 ID (외래 키)
  // 왜 별도로 저장하나? 관계 조회 없이 빠르게 조회하기 위해
  @Column()
  userId: number;

  // 생성일시: 게시글이 작성된 시간
  // CreateDateColumn: TypeORM이 자동으로 생성 시간 저장
  // 왜 필요한가? 게시글 목록을 시간순으로 정렬하기 위해
  @CreateDateColumn()
  createdAt: Date;

  // 조회수: 게시글이 조회된 횟수
  // default: 0 - 기본값 0으로 설정
  // 왜 필요한가? 인기 게시글을 파악하기 위해
  @Column({ default: 0 })
  views: number;

  // 게시글 이미지 URL (선택적)
  // nullable: true - 이미지가 없는 게시글도 가능
  @Column({ nullable: true })
  image: string;

  // OneToMany 관계: 한 게시글은 여러 댓글을 가질 수 있음
  // cascade: true - 게시글이 삭제되면 댓글도 자동 삭제
  // 왜 CASCADE인가? 게시글이 삭제되면 댓글도 의미가 없어지므로
  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];
}
