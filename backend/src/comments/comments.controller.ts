import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products/:productId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('productId') productId: string) {
    return this.commentsService.findByProduct(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.create(productId, dto, user.userId);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('commentId') commentId: string, @CurrentUser() user: any) {
    return this.commentsService.remove(commentId, user.userId);
  }
}

@Controller('comments')
export class MyCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    return this.commentsService.findByUser(user.userId);
  }
}
