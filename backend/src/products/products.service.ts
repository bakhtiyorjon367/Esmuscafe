import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../libs/enums/role.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, user: any): Promise<Product> {
    if (user.role === Role.RESTAURANT_OWNER) {
      if (createProductDto.restaurantId !== user.restaurantId?.toString()) {
        throw new ForbiddenException('You can only create products for your own restaurant');
      }
    }

    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(restaurantId?: string, category?: string, tag?: string): Promise<Product[]> {
    const filter: any = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    return this.productModel.find(filter).populate('restaurantId', 'name').exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('restaurantId', 'name').exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: any): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (user.role === Role.RESTAURANT_OWNER) {
      if (product.restaurantId.toString() !== user.restaurantId?.toString()) {
        throw new ForbiddenException('You can only update products for your own restaurant');
      }
    }

    Object.assign(product, updateProductDto);
    return product.save();
  }

  async remove(id: string, user: any): Promise<void> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (user.role === Role.RESTAURANT_OWNER) {
      if (product.restaurantId.toString() !== user.restaurantId?.toString()) {
        throw new ForbiddenException('You can only delete products for your own restaurant');
      }
    }

    await this.productModel.findByIdAndDelete(id);
  }

  async toggleLike(productId: string, userId: string): Promise<{ likeCount: number; liked: boolean }> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const userObjectId = new Types.ObjectId(userId);
    const alreadyLiked = product.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      product.likes = product.likes.filter((id) => id.toString() !== userId) as Types.ObjectId[];
      product.likeCount = Math.max(0, product.likeCount - 1);
    } else {
      product.likes.push(userObjectId);
      product.likeCount += 1;
    }

    await product.save();
    return { likeCount: product.likeCount, liked: !alreadyLiked };
  }

  async findLikedByUser(userId: string): Promise<Product[]> {
    return this.productModel
      .find({ likes: new Types.ObjectId(userId) })
      .populate('restaurantId', 'name')
      .exec();
  }

  async incrementCommentCount(productId: string, delta: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { commentCount: delta },
    });
  }
}
