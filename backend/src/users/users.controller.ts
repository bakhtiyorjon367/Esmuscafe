import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { IsString, IsOptional, MinLength } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../libs/enums/role.enum';

class UpdateMeDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}

class AddressDto {
  @IsString()
  address: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('owners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOwners() {
    return this.usersService.findOwners();
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateMeDto) {
    const updated = await this.usersService.updateOwnerCredentials(user.userId, dto);
    const { password: _pw, ...safe } = updated.toObject();
    return safe;
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: any) {
    await this.usersService.softDelete(user.userId);
    return { message: 'Account deleted' };
  }

  @Get('me/addresses')
  @UseGuards(JwtAuthGuard)
  getAddresses(@CurrentUser() user: any) {
    return this.usersService.getAddresses(user.userId);
  }

  @Post('me/addresses')
  @UseGuards(JwtAuthGuard)
  addAddress(@CurrentUser() user: any, @Body() dto: AddressDto) {
    return this.usersService.addAddress(user.userId, dto);
  }

  @Patch('me/addresses/:index')
  @UseGuards(JwtAuthGuard)
  updateAddress(
    @CurrentUser() user: any,
    @Param('index', ParseIntPipe) index: number,
    @Body() dto: AddressDto,
  ) {
    return this.usersService.updateAddress(user.userId, index, dto);
  }

  @Delete('me/addresses/:index')
  @UseGuards(JwtAuthGuard)
  removeAddress(
    @CurrentUser() user: any,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.usersService.removeAddress(user.userId, index);
  }
}
