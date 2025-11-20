import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Post } from '../../../shared/entities/post.entity';
import { QueryPostDto } from '../dtos/request/query-post.dto';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
  ) {}

  async findAll(
    query: QueryPostDto,
  ): Promise<{ data: Post[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.title = ILike(`%${search}%`);
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Post | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOneBySlug(slug: string): Promise<Post | null> {
    return this.repository.findOne({ where: { slug } });
  }

  async createAndSave(data: Partial<Post>): Promise<Post> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<Post>): Promise<Post> {
    await this.repository.update(id, data);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Không tìm thấy bài viết sau khi cập nhật');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async isSlugTaken(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await this.repository.findOne({
      where: excludeId
        ? { slug, id: Not(excludeId) }
        : { slug },
    });
    return !!existing;
  }
}


