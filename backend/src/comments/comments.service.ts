import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async findByProduct(productId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ productId })
      .populate('userId', 'nickname name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(productId: string, dto: CreateCommentDto, userId: string): Promise<Comment> {
    const comment = new this.commentModel({ productId, userId, text: dto.text });
    await comment.save();
    await this.productsService.incrementCommentCount(productId, 1);
    return this.commentModel.findById(comment._id).populate('userId', 'nickname name').exec();
  }

  async remove(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.commentModel.findByIdAndDelete(commentId);
    await this.productsService.incrementCommentCount(comment.productId.toString(), -1);
  }

  async findByUser(userId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ userId })
      .populate('productId', 'name image restaurantId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
