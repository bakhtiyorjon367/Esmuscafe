import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantWithOwnerDto } from './dto/create-restaurant-with-owner.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Role } from '../libs/enums/role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateRestaurantWithOwnerDto): Promise<RestaurantDocument> {
    const owner = await this.usersService.create({
      nickname: dto.ownerNickname,
      password: dto.ownerPassword,
      name: dto.ownerLogin,
      role: Role.RESTAURANT_OWNER,
    });
    try {
      const restaurant = new this.restaurantModel({
        name: dto.name,
        description: dto.description ?? '',
        image: dto.image ?? '',
        address: dto.address ?? '',
        status: dto.status ?? 'active',
        isOpened: dto.isOpened ?? true,
        ...(dto.workingHours && { workingHours: dto.workingHours }),
        ownerId: owner._id,
      });
      const saved = await restaurant.save();
      await this.usersService.updateRestaurantId(owner._id!.toString(), saved._id!.toString());
      return saved;
    } catch (err) {
      await this.usersService.removeById(owner._id!.toString());
      throw err;
    }
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find({ status: { $in: ['active', 'inactive'] } }).populate('ownerId', 'name email').exec();
  }

  async findAllAdmin(): Promise<Restaurant[]> {
    return this.restaurantModel.find().populate('ownerId', 'name nickname email').exec();
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).populate('ownerId', 'name email').exec();
    
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    
    return restaurant;
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto, user: any): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (user.role !== Role.ADMIN && restaurant.ownerId.toString() !== user.userId.toString()) {
      throw new ForbiddenException('You do not have permission to update this restaurant');
    }

    const { ownerNickname, ownerLogin, ownerNewPassword, ...restaurantFields } = updateRestaurantDto;

    if (ownerNickname !== undefined || ownerLogin !== undefined || ownerNewPassword?.trim()) {
      await this.usersService.updateOwnerCredentials(restaurant.ownerId.toString(), {
        ...(ownerNickname !== undefined && { nickname: ownerNickname }),
        ...(ownerLogin !== undefined && { name: ownerLogin }),
        ...(ownerNewPassword?.trim() && { password: ownerNewPassword }),
      });
    }

    const setPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(restaurantFields)) {
      if (key === 'workingHours' && val && typeof val === 'object') {
        for (const [field, fieldVal] of Object.entries(val as object)) {
          setPayload[`workingHours.${field}`] = fieldVal;
        }
      } else {
        setPayload[key] = val;
      }
    }

    const updated = await this.restaurantModel.findByIdAndUpdate(
      id,
      { $set: setPayload },
      { new: true },
    );
    return updated!;
  }

  async remove(id: string): Promise<void> {
    const result = await this.restaurantModel.findByIdAndDelete(id);
    
    if (!result) {
      throw new NotFoundException('Restaurant not found');
    }
  }

  async findByOwnerId(ownerId: string): Promise<Restaurant | null> {
    return this.restaurantModel.findOne({ ownerId }).exec();
  }
}
