import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../libs/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByNickname(loginDto.nickname);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      nickname: user.nickname,
      role: user.role,
      restaurantId: user.restaurantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        nickname: user.nickname,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      id: user._id,
      nickname: user.nickname,
      name: user.name,
      role: user.role,
    };
  }

  async signup(nickname: string, password: string) {
    const dto: CreateUserDto = {
      nickname,
      password,
      name: nickname,
      role: Role.USER,
    };
    const user = await this.usersService.create(dto);

    const payload = {
      sub: user._id,
      nickname: user.nickname,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        nickname: user.nickname,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id,
      nickname: user.nickname,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
      addresses: user.addresses ?? [],
    };
  }
}
