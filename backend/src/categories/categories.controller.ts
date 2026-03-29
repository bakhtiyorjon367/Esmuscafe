import { Controller, Get, Post, Body, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../libs/enums/role.enum';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESTAURANT_OWNER)
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: any) {
    return this.categoriesService.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('restaurantId') restaurantId: string) {
    return this.categoriesService.findByRestaurant(restaurantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESTAURANT_OWNER)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.remove(id, user);
  }
}
