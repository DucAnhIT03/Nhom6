import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { QueryPostDto } from '../dtos/request/query-post.dto';
import { CreatePostDto } from '../dtos/request/create-post.dto';
import { UpdatePostDto } from '../dtos/request/update-post.dto';
import { PostResponseDto } from '../dtos/response/post-response.dto';
import { ResponseUtil } from '../../../shared/utils/response.util';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(
    title: string,
    excludeId?: number,
  ): Promise<string> {
    let base = this.slugify(title);
    if (!base) {
      throw new BadRequestException('Tiêu đề không hợp lệ');
    }
    let slug = base;
    let i = 1;
    while (await this.postRepository.isSlugTaken(slug, excludeId)) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async findAll(query: QueryPostDto) {
    const { data, total } = await this.postRepository.findAll(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const items = data.map((item) => PostResponseDto.fromEntity(item));
    return ResponseUtil.success(
      ResponseUtil.paginated(items, total, page, limit),
    );
  }

  async findOne(idOrSlug: string) {
    let post: any = null;
    if (/^\d+$/.test(idOrSlug)) {
      post = await this.postRepository.findOne(Number(idOrSlug));
    }
    if (!post) {
      post = await this.postRepository.findOneBySlug(idOrSlug);
    }
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return ResponseUtil.success(PostResponseDto.fromEntity(post));
  }

  async create(dto: CreatePostDto) {
    const slug = await this.ensureUniqueSlug(dto.title);
    const post = await this.postRepository.createAndSave({
      title: dto.title,
      slug,
      content: dto.content,
      thumbnailUrl: dto.thumbnailUrl,
      status: dto.status || 'DRAFT',
    });
    return ResponseUtil.success(
      PostResponseDto.fromEntity(post),
      'Tạo bài viết thành công',
    );
  }

  async update(id: number, dto: UpdatePostDto) {
    const existing = await this.postRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    const slug =
      dto.title && dto.title !== existing.title
        ? await this.ensureUniqueSlug(dto.title, id)
        : existing.slug;
    const post = await this.postRepository.update(id, {
      title: dto.title ?? existing.title,
      slug,
      content: dto.content ?? existing.content,
      thumbnailUrl: dto.thumbnailUrl ?? existing.thumbnailUrl,
      status: dto.status ?? existing.status,
    });
    return ResponseUtil.success(
      PostResponseDto.fromEntity(post),
      'Cập nhật bài viết thành công',
    );
  }

  async delete(id: number) {
    const existing = await this.postRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    await this.postRepository.delete(id);
    return ResponseUtil.success(null, 'Đã xóa bài viết');
  }
}

