import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class CartItemEmbedded {
  productId: Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
}

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: false, default: null })
  restaurantId: Types.ObjectId | null;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        priceSnapshot: { type: Number },
      },
    ],
    default: [],
  })
  items: CartItemEmbedded[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
