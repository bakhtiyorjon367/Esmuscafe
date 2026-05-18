import {
  IsNotEmpty, IsString, IsNumber, IsMongoId, IsBoolean,
  IsOptional, Min, IsArray, IsIn, ArrayMaxSize,
} from 'class-validator';

export class CreateProductDto {
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  ingredients?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @IsOptional()
  images?: string[];

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  readyAt?: number | null;

  @IsArray()
  @IsOptional()
  @IsIn(['suggested', 'new'], { each: true })
  tags?: string[];
}
