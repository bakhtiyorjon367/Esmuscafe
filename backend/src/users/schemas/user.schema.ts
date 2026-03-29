import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../libs/enums/role.enum';

export type UserDocument = User & Document;

export class UserAddress {
  address: string;
}

@Schema({ timestamps: true })
export class User {
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true, sparse: true })
  nickname: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Role, default: Role.USER })
  role: Role;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: false })
  restaurantId?: Types.ObjectId;

  @Prop({ required: false, unique: true, sparse: true })
  telegramId?: string;

  @Prop({
    type: [{ address: { type: String } }],
    default: [],
  })
  addresses: UserAddress[];

  @Prop({ required: true, enum: ['active', 'deleted'], default: 'active' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
