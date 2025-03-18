import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Category } from 'src/features/categories/entities/category.entity';
import { UploadModule } from '../../../uploads/upload.module';
import { UploadService } from '../../../uploads/upload.service';

@Module({
  imports:[UploadModule,TypeOrmModule.forFeature([Book,Category])],
  providers: [BooksService, UploadService],
  exports: [BooksService, UploadService],
  controllers: [BooksController]
})
export class BooksModule {}
