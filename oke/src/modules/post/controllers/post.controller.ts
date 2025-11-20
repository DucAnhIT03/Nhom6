import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post as PostMethod,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { QueryPostDto } from '../dtos/request/query-post.dto';
import { CreatePostDto } from '../dtos/request/create-post.dto';
import { UpdatePostDto } from '../dtos/request/update-post.dto';
import { Public, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/constraints';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @Public()
  async findAll(@Query() query: QueryPostDto) {
    return this.postService.findAll(query);
  }

  @Get(':idOrSlug')
  @Public()
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.postService.findOne(idOrSlug);
  }

  @PostMethod()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async create(@Body() body: CreatePostDto) {
    return this.postService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleName.ROLE_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.delete(id);
  }
}

