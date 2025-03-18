import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateBookDto extends PartialType(CreateBookDto) {
    @IsOptional()
    @IsString()
    title?: string;
  
    @IsOptional()
    @IsString()
    editorial?: string;
  
    @IsOptional()
    @IsString()
    codigo?: string;

    @IsOptional()
    @IsString()
    author?: string;
  
    @IsOptional()
    @IsInt()
    categoryId?: number;
}