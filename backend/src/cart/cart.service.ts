import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel
      .findOne({ userId })
      .populate('items.productId', 'name image price discount restaurantId isAvailable')
      .exec();

    if (!cart) {
      cart = await this.cartModel.create({ userId, items: [] });
    }

    return cart;
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    const product = await this.productsService.findOne(dto.productId);
    if (!product) throw new NotFoundException('Product not found');

    const productDoc = product as any;
    const productRestaurantId = productDoc.restaurantId?._id?.toString() ?? productDoc.restaurantId?.toString();

    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = new this.cartModel({ userId, restaurantId: productRestaurantId, items: [] });
    }

    if (cart.restaurantId && cart.restaurantId.toString() !== productRestaurantId) {
      throw new BadRequestException(
        'Cart contains items from a different restaurant. Clear your cart first.',
      );
    }

    if (!cart.restaurantId) {
      cart.restaurantId = new Types.ObjectId(productRestaurantId);
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === dto.productId,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity ?? 1;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(dto.productId),
        quantity: dto.quantity ?? 1,
        priceSnapshot: productDoc.price,
      });
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) throw new NotFoundException('Item not in cart');

    if (dto.quantity === 0) {
      cart.items = cart.items.filter((i) => i.productId.toString() !== productId) as any;
    } else {
      item.quantity = dto.quantity;
    }

    if (cart.items.length === 0) cart.restaurantId = null;

    await cart.save();
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId) as any;
    if (cart.items.length === 0) cart.restaurantId = null;

    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { items: [], restaurantId: null },
      { new: true, upsert: true },
    );
    return cart;
  }
}
