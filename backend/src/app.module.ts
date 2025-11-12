import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { SemesterModule } from './semester/semester.module';
import { CommentsModule } from './comments/comments.module';
import { MembersModule } from './members/members.module';
import { MessageModule } from './messages/messages.module';

@Module({
  imports: [
    PostsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'user',
      password: '1234',
      database: 'db',
      charset: 'utf8mb4',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      extra: {
        charset: 'utf8mb4',
        clientFlags: 0, // 클라이언트 연결 charset
      },
    }),
    UserModule,
    PostsModule,
    SemesterModule,
    CommentsModule,
    MembersModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
