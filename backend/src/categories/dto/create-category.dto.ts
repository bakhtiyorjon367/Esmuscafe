import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsOptional()
  restaurantId?: string;
}
