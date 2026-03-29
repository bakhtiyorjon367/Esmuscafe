import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'deleted'] })
  status: string;

  @Prop({ default: true })
  isOpened: boolean;

  @Prop({
    type: { open: String, close: String },
    _id: false,
    default: () => ({ open: '09:00', close: '22:00' }),
  })
  workingHours: { open: string; close: string };
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
