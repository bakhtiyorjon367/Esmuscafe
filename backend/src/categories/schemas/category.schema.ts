import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });
