import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsService } from './comments.service';
import { CommentsController, MyCommentsController } from './comments.controller';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    ProductsModule,
  ],
  controllers: [CommentsController, MyCommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
