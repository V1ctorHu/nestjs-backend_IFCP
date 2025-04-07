/* import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { Category } from '../categories/entities/category.entity';
import { Like } from 'typeorm';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async search(query: string) {
    const sanitizedQuery = query.replace(/"/g, '').trim();

    const books = await this.bookRepository.find({
      where: [
        { title: Like(`%${sanitizedQuery}%`) },
        { author: Like(`%${sanitizedQuery}%`) },
        { editorial: Like(`%${sanitizedQuery}%`) },
        { codigo: Like(`%${sanitizedQuery}%`) },
      ],
      relations: ['category'], // Incluye la categoría si es necesario
    });

    const categories = await this.categoryRepository.find({
      where: { nombre: Like(`%${sanitizedQuery}%`) },
    });

    return {
      books,
      categories,
    };
  }
} */