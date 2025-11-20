import { Post } from '../../../../shared/entities/post.entity';

export class PostResponseDto {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: Post): PostResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      thumbnailUrl: entity.thumbnailUrl,
      content: entity.content,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

