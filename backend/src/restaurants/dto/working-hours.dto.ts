import { IsOptional, IsString, Matches } from 'class-validator';

export class WorkingHoursDto {
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'open must be in HH:mm format' })
  open?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'close must be in HH:mm format' })
  close?: string;
}
