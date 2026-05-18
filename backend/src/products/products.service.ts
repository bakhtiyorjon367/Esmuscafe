import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import * as path from 'path';
import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import sharp from 'sharp';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../libs/enums/role.enum';
import { getProductsUploadAbsoluteDir, PRODUCT_UPLOAD_PUBLIC_PREFIX } from '../libs/product-upload.paths';

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
    this.syncProductImageFields(createdProduct);
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

    if (updateProductDto.images && updateProductDto.images.length > 5) {
      throw new BadRequestException('Maximum 5 images per product');
    }
    Object.assign(product, updateProductDto);
    this.syncProductImageFields(product);
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

  private assertOwnerAccess(product: ProductDocument, user: { role: Role; restaurantId?: Types.ObjectId | string }) {
    if (user.role === Role.RESTAURANT_OWNER) {
      if (product.restaurantId.toString() !== user.restaurantId?.toString()) {
        throw new ForbiddenException('You can only manage products for your own restaurant');
      }
    }
  }

  private syncProductImageFields(product: ProductDocument) {
    const imgs = product.images?.filter(Boolean) ?? [];
    if (imgs.length > 0) {
      product.images = imgs.slice(0, 5);
      product.image = product.images[0];
      return;
    }
    if (product.image) {
      product.images = [product.image];
      return;
    }
    product.images = [];
    product.image = '';
  }

  /**
   * Saves uploaded image buffers to disk (WebP + thumb) and appends URLs to product.images.
   */
  async appendUploadedImages(
    productId: string,
    files: Express.Multer.File[],
    user: { role: Role; restaurantId?: Types.ObjectId | string },
  ): Promise<{ urls: string[] }> {
    if (!files?.length) {
      throw new BadRequestException('No image files');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    this.assertOwnerAccess(product, user);

    const current = product.images?.length ?? (product.image ? 1 : 0);
    if (current + files.length > 5) {
      throw new BadRequestException('Maximum 5 images per product');
    }

    const dir = getProductsUploadAbsoluteDir();
    await mkdir(dir, { recursive: true });

    const newUrls: string[] = [];
    for (const file of files) {
      const id = randomUUID();
      const base = `${id}.webp`;
      const thumbBase = `${id}_thumb.webp`;
      const dest = path.join(dir, base);
      const destThumb = path.join(dir, thumbBase);

      try {
        await sharp(file.buffer)
          .rotate()
          .webp({ quality: 86 })
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .toFile(dest);

        await sharp(file.buffer)
          .rotate()
          .resize(80, 80, { fit: 'cover' })
          .webp({ quality: 82 })
          .toFile(destThumb);
      } catch {
        throw new BadRequestException('Could not process image; use JPEG, PNG, GIF, or WebP');
      }

      newUrls.push(`${PRODUCT_UPLOAD_PUBLIC_PREFIX}/${base}`);
    }

    product.images = [...(product.images ?? []), ...newUrls];
    this.syncProductImageFields(product);
    await product.save();
    return { urls: newUrls };
  }
}
