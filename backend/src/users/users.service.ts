import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserAddress } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../libs/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ nickname: createUserDto.nickname });

    if (existingUser) {
      throw new ConflictException('User with this nickname already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      role: createUserDto.role ?? Role.USER,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findByNickname(nickname: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ nickname }).exec();
    if (user && user.status === 'deleted') {
      throw new ForbiddenException('This account has been deleted');
    }
    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async updateRestaurantId(userId: string, restaurantId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { restaurantId },
      { new: true }
    ).exec();
  }

  async removeById(userId: string): Promise<void> {
    await this.userModel.findByIdAndDelete(userId).exec();
  }

  async findOwners(): Promise<{ _id: string; name: string; nickname: string }[]> {
    const users = await this.userModel
      .find({ role: Role.RESTAURANT_OWNER })
      .select('name nickname')
      .lean()
      .exec();
    return users.map((u) => ({
      _id: String(u._id),
      name: u.name,
      nickname: u.nickname,
    }));
  }

  async updateOwnerCredentials(
    userId: string,
    payload: { nickname?: string; name?: string; password?: string },
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (payload.nickname !== undefined) {
      const existing = await this.userModel.findOne({ nickname: payload.nickname }).exec();
      if (existing && existing._id.toString() !== userId) {
        throw new ConflictException('User with this nickname already exists');
      }
      user.nickname = payload.nickname;
    }
    if (payload.name !== undefined) user.name = payload.name;
    if (payload.password !== undefined && payload.password.trim() !== '') {
      user.password = await bcrypt.hash(payload.password, 10);
    }
    return user.save();
  }

  async getAddresses(userId: string): Promise<UserAddress[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return user.addresses ?? [];
  }

  async addAddress(userId: string, address: UserAddress): Promise<UserAddress[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    user.addresses = [...(user.addresses ?? []), address];
    await user.save();
    return user.addresses;
  }

  async updateAddress(userId: string, index: number, address: UserAddress): Promise<UserAddress[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    if (index < 0 || index >= (user.addresses ?? []).length) {
      throw new NotFoundException('Address not found');
    }
    user.addresses[index] = address;
    user.markModified('addresses');
    await user.save();
    return user.addresses;
  }

  async removeAddress(userId: string, index: number): Promise<UserAddress[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    if (index < 0 || index >= (user.addresses ?? []).length) {
      throw new NotFoundException('Address not found');
    }
    user.addresses.splice(index, 1);
    user.markModified('addresses');
    await user.save();
    return user.addresses;
  }

  async softDelete(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    user.status = 'deleted';
    await user.save();
  }
}
