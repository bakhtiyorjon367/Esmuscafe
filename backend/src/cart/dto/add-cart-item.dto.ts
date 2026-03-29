import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class AddCartItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;
}
