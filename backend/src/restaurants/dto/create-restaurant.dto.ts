import { IsNotEmpty, IsString, IsMongoId, IsOptional, IsIn } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsMongoId()
  @IsNotEmpty()
  ownerId: string;

  @IsIn(['active', 'inactive', 'deleted'])
  @IsOptional()
  status?: string;
}
