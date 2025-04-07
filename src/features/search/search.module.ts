/* import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
  ],
  controllers: [SearchController], // Registra el controlador de búsqueda
  providers: [BooksService], // Registra el servicio que maneja la lógica de búsqueda
})
export class SearchModule {} */