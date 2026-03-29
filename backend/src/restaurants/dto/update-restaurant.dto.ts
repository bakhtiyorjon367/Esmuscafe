import { IsBoolean, IsOptional, IsString, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkingHoursDto } from './working-hours.dto';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

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
  @IsOptional()
  ownerNickname?: string;

  @IsString()
  @IsOptional()
  ownerLogin?: string;

  @IsString()
  @IsOptional()
  ownerNewPassword?: string;
}
