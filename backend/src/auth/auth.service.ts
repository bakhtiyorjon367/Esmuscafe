import { Injectable, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../libs/enums/role.enum';
import { parseAndValidateTelegramInitData } from './telegram-init-data';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private issueToken(user: {
    _id?: unknown;
    nickname: string;
    name: string;
    role: Role;
    restaurantId?: unknown;
  }) {
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

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByNickname(loginDto.nickname);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user);
  }

  async loginWithTelegram(initData: string) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new ServiceUnavailableException('Telegram login is not configured');
    }

    const tgUser = parseAndValidateTelegramInitData(initData, botToken);
    if (!tgUser) {
      throw new UnauthorizedException('Invalid Telegram credentials');
    }

    const user = await this.usersService.findOrCreateFromTelegram(tgUser);
    return this.issueToken(user);
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

    return this.issueToken(user);
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
