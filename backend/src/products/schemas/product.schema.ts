import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: '' })
  ingredients: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: true })
  isAvailable: boolean;

  /** Minutes until product is ready (null = ready now) */
  @Prop({ type: Number, default: null })
  readyAt: number | null;

  /** Badges: 'suggested' | 'new' */
  @Prop({ type: [String], default: [] })
  tags: string[];

  /** User IDs who liked this product */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
