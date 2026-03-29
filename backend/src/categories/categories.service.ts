import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Role } from '../libs/enums/role.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto, user: { role: string; restaurantId?: string }): Promise<CategoryDocument> {
    const restaurantId =
      user.role === Role.RESTAURANT_OWNER
        ? user.restaurantId
        : dto.restaurantId;

    if (!restaurantId) {
      throw new ForbiddenException('Restaurant ID is required');
    }

    if (user.role === Role.RESTAURANT_OWNER && user.restaurantId !== restaurantId) {
      throw new ForbiddenException('You can only create categories for your own restaurant');
    }

    const existing = await this.categoryModel
      .findOne({ restaurantId, name: dto.name.trim() })
      .exec();
    if (existing) {
      throw new ConflictException('A category with this name already exists for this restaurant');
    }

    const category = new this.categoryModel({
      name: dto.name.trim(),
      restaurantId,
    });
    return category.save();
  }

  async findByRestaurant(restaurantId: string): Promise<CategoryDocument[]> {
    if (!restaurantId?.trim()) {
      return [];
    }
    return this.categoryModel.find({ restaurantId }).sort({ name: 1 }).exec();
  }

  async remove(id: string, user: { role: string; userId: string; restaurantId?: string }): Promise<void> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (user.role === Role.RESTAURANT_OWNER) {
      if (user.restaurantId !== category.restaurantId.toString()) {
        throw new ForbiddenException('You can only delete categories for your own restaurant');
      }
    }

    await this.categoryModel.findByIdAndDelete(id).exec();
  }
}
