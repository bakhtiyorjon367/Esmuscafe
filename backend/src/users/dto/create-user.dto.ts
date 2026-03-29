import { IsNotEmpty, IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { Role } from '../../libs/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsMongoId()
  @IsOptional()
  restaurantId?: string;
}
