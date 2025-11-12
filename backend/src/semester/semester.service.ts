import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Semester } from 'src/user/entities/semester.entity';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
  ) {}
  async search(keyword: string): Promise<Semester[]> {
    return this.semesterRepository.find({
      where: { title: Like(`%${keyword}%`) },
    });
  }
  // 전체 조회 (: 타입 지정 왼쪽을 오른쪽으로 변환한다)
  async getAll(): Promise<Semester[]> {
    return await this.semesterRepository.find();
  }

  // 단일 조회
  async getOne(id: number): Promise<Semester> {
    const asd = await this.semesterRepository.findOne({
      where: { id },
    }); // QueryBuilder
    if (!asd) {
      throw new NotFoundException('gg');
    } //에러를 만들어주는 코드
    return asd;
  }

  // 생성
  async create(data: Partial<Semester>): Promise<Semester> {
    const semester = this.semesterRepository.create(data);
    return await this.semesterRepository.save(semester);
  }

  // 수정
  async update(id: number, data: Partial<Semester>): Promise<Semester> {
    await this.semesterRepository.update(id, data);
    return this.getOne(id);
  }

  // 삭제
  async remove(id: number): Promise<void> {
    await this.semesterRepository.delete(id);
  }

  // semester.service.ts
  async getBasicInfo(): Promise<Partial<Semester>[]> {
    return await this.semesterRepository.find({
      select: ['id', 'title', 'description', 'imageUrl'], // 필요한 필드만 선택
    });
  }
}
