import { IsNotEmpty, IsString, IsOptional, IsIn, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkingHoursDto } from './working-hours.dto';

export class CreateRestaurantWithOwnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsIn(['active', 'inactive', 'deleted'])
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  isOpened?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;

  @IsString()
  @IsNotEmpty()
  ownerNickname: string;

  @IsString()
  @IsNotEmpty()
  ownerPassword: string;

  @IsString()
  @IsNotEmpty()
  ownerLogin: string;
}
