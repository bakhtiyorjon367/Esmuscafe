import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { RestaurantsService } from './restaurants/restaurants.service';
import { ProductsService } from './products/products.service';
import { Role } from './libs/enums/role.enum';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const restaurantsService = app.get(RestaurantsService);
  const productsService = app.get(ProductsService);

  try {
    console.log('Starting seed...');
    
    // Clear existing data
    const connection = app.get<Connection>(getConnectionToken());
    await connection.collection('users').deleteMany({});
    await connection.collection('restaurants').deleteMany({});
    await connection.collection('products').deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin user
    const admin = await usersService.create({
      nickname: 'admin',
      password: 'admin123',
      name: 'Admin User',
      role: Role.ADMIN,
    });
    console.log('✓ Admin user created');

    // Create 3 restaurants with owner accounts (B2B flow)
    const restaurant1 = await restaurantsService.create({
      name: 'Pizza Palace',
      description: 'Authentic Italian pizza made with love and traditional recipes',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      address: '123 Italian Avenue, Food District',
      status: 'active',
      ownerNickname: 'owner1',
      ownerPassword: 'owner123',
      ownerLogin: 'Mario Rossi',
    });

    const restaurant2 = await restaurantsService.create({
      name: 'Burger House',
      description: 'Juicy gourmet burgers and crispy fries that will blow your mind',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      address: '456 Burger Street, Downtown',
      status: 'active',
      ownerNickname: 'owner2',
      ownerPassword: 'owner123',
      ownerLogin: 'Luigi Verde',
    });

    const restaurant3 = await restaurantsService.create({
      name: 'Sushi Garden',
      description: 'Fresh sushi and Japanese cuisine prepared by expert chefs',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
      address: '789 Sakura Lane, East Side',
      status: 'active',
      ownerNickname: 'owner3',
      ownerPassword: 'owner123',
      ownerLogin: 'Sofia Bianchi',
    });
    console.log('✓ 3 restaurants with owners created');

    // Create products for Pizza Palace
    const pizzaPalaceProducts = [
      {
        restaurantId: restaurant1._id.toString(),
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        ingredients: 'Tomato sauce, mozzarella, fresh basil, olive oil',
        price: 12.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant1._id.toString(),
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni and extra cheese',
        ingredients: 'Tomato sauce, mozzarella, pepperoni',
        price: 14.99,
        discount: 2.00,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant1._id.toString(),
        name: 'Quattro Formaggi',
        description: 'Four cheese pizza for cheese lovers',
        ingredients: 'Mozzarella, gorgonzola, parmesan, fontina',
        price: 15.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant1._id.toString(),
        name: 'Vegetarian Pizza',
        description: 'Fresh vegetables and herbs on a crispy crust',
        ingredients: 'Tomato sauce, bell peppers, mushrooms, olives, basil',
        price: 13.99,
        discount: 1.50,
        image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant1._id.toString(),
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        ingredients: 'Mascarpone, espresso, ladyfingers, cocoa',
        price: 6.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
        category: 'Sweets',
        isAvailable: true,
      },
    ];

    // Create products for Burger House
    const burgerHouseProducts = [
      {
        restaurantId: restaurant2._id.toString(),
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, and special sauce',
        ingredients: 'Beef patty, lettuce, tomato, special sauce, bun',
        price: 10.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        category: 'Meat',
        isAvailable: true,
      },
      {
        restaurantId: restaurant2._id.toString(),
        name: 'Cheese Burger',
        description: 'Double beef with melted cheddar cheese',
        ingredients: 'Double beef, cheddar cheese, lettuce, tomato, pickles',
        price: 12.99,
        discount: 1.00,
        image: 'https://images.unsplash.com/photo-1551615593-ef5fe247e8f7?w=500',
        category: 'Meat',
        isAvailable: true,
      },
      {
        restaurantId: restaurant2._id.toString(),
        name: 'Bacon Burger',
        description: 'Crispy bacon with BBQ sauce and onion rings',
        ingredients: 'Beef patty, bacon, BBQ sauce, onion rings, bun',
        price: 13.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500',
        category: 'Meat',
        isAvailable: true,
      },
      {
        restaurantId: restaurant2._id.toString(),
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        ingredients: 'Potatoes, sea salt, vegetable oil',
        price: 4.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant2._id.toString(),
        name: 'Onion Rings',
        description: 'Crispy battered onion rings',
        ingredients: 'Onions, batter, vegetable oil',
        price: 5.99,
        discount: 0.50,
        image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant2._id.toString(),
        name: 'Milkshake',
        description: 'Creamy vanilla milkshake',
        ingredients: 'Vanilla ice cream, milk, whipped cream',
        price: 5.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
        category: 'Drinks',
        isAvailable: true,
      },
    ];

    // Create products for Sushi Garden
    const sushiGardenProducts = [
      {
        restaurantId: restaurant3._id.toString(),
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber roll',
        ingredients: 'Crab, avocado, cucumber, sushi rice, nori',
        price: 8.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant3._id.toString(),
        name: 'Salmon Nigiri',
        description: 'Fresh salmon over pressed rice',
        ingredients: 'Fresh salmon, sushi rice, wasabi',
        price: 7.99,
        discount: 1.00,
        image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500',
        category: 'Meat',
        isAvailable: true,
      },
      {
        restaurantId: restaurant3._id.toString(),
        name: 'Tuna Sashimi',
        description: 'Premium tuna slices',
        ingredients: 'Premium tuna, soy sauce, ginger',
        price: 12.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500',
        category: 'Meat',
        isAvailable: true,
      },
      {
        restaurantId: restaurant3._id.toString(),
        name: 'Dragon Roll',
        description: 'Eel and cucumber topped with avocado',
        ingredients: 'Eel, cucumber, avocado, sushi rice, nori',
        price: 13.99,
        discount: 2.00,
        image: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant3._id.toString(),
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu',
        ingredients: 'Miso paste, tofu, seaweed, green onions',
        price: 3.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1606491048210-a45c84148aaa?w=500',
        category: 'Food',
        isAvailable: true,
      },
      {
        restaurantId: restaurant3._id.toString(),
        name: 'Green Tea',
        description: 'Hot Japanese green tea',
        ingredients: 'Green tea leaves, hot water',
        price: 2.99,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500',
        category: 'Drinks',
        isAvailable: true,
      },
    ];

    // Create all products
    const allProducts = [
      ...pizzaPalaceProducts,
      ...burgerHouseProducts,
      ...sushiGardenProducts,
    ];

    for (const productData of allProducts) {
      await productsService.create(productData, { role: Role.ADMIN, userId: admin._id });
    }
    console.log('✓ Created products for all restaurants');

    console.log('\n=== Seed completed successfully! ===\n');
    console.log('Login credentials (nickname / password):');
    console.log('Admin: admin / admin123');
    console.log('Owner 1 (Pizza Palace): owner1 / owner123');
    console.log('Owner 2 (Burger House): owner2 / owner123');
    console.log('Owner 3 (Sushi Garden): owner3 / owner123');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await app.close();
  }
}

seed();
