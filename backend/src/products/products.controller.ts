import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../libs/enums/role.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT_OWNER)
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(
    @Query('restaurantId') restaurantId?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
  ) {
    return this.productsService.findAll(restaurantId, category, tag);
  }

  @Get('liked')
  @UseGuards(JwtAuthGuard)
  findLiked(@CurrentUser() user: any) {
    return this.productsService.findLikedByUser(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.toggleLike(id, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT_OWNER)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT_OWNER)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user);
  }
}
