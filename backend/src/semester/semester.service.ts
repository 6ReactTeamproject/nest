import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from 'src/user/entities/semester.entity';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
  ) {}

  async getAll(): Promise<Semester[]> {
    return await this.semesterRepository.find({
      relations: ['author'],
    });
  }

  async getOne(id: number): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    return semester;
  }

  async create(data: Partial<Semester>): Promise<Semester> {
    const semester = this.semesterRepository.create(data);
    return await this.semesterRepository.save(semester);
  }

  async update(
    id: number,
    data: Partial<Semester>,
    userId: number,
  ): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    if (semester.author.id !== userId) {
      throw new ForbiddenException('본인의 글만 수정할 수 있습니다.');
    }
    await this.semesterRepository.update(id, data);
    return this.getOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    if (semester.author.id !== userId) {
      throw new ForbiddenException('본인의 글만 삭제할 수 있습니다.');
    }
    await this.semesterRepository.delete(id);
  }

  async getBasicInfo(): Promise<Partial<Semester>[]> {
    return await this.semesterRepository.find({
      select: ['id', 'title', 'description', 'imageUrl'],
    });
  }
}
