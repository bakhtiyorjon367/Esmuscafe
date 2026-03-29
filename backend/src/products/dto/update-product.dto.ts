import { IsOptional, IsString, IsNumber, IsBoolean, Min, IsArray, IsIn } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  ingredients?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  category?: string;

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
