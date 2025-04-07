import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedBooksController } from './saved-books.controller';
import { SavedBooksService } from './saved-books.service';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { SavedBook } from './dto/entities/saved-book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedBook, Book, User]), 
  ],
  controllers: [SavedBooksController], 
  providers: [SavedBooksService],
  exports: [SavedBooksService], 
})
export class SavedBookModule {}