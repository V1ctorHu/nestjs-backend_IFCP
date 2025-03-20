import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository,
    @InjectRepository(Category)
    private readonly categoryRepository,
  ) {}

  async create(createBookDto: CreateBookDto, filePath: string) {
    const { title, editorial, codigo, author, categoryId } = createBookDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category)
      throw new NotFoundException(
        `Categoría con ID ${categoryId} no encontrada`,
      );

    const newBook = this.bookRepository.create({
      title,
      editorial,
      codigo,
      author,
      category,
      file_path: filePath,
    });
    return await this.bookRepository.save(newBook);
  }

  async findAll(): Promise<Book[]> {
    return await this.bookRepository.find({
      relations: ['category'],
    });
  }

  async findOne(id: number) {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!book) throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.findOne(id);
    if (updateBookDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateBookDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${updateBookDto.categoryId} no encontrada`,
        );
      }

      book.category = category;
      delete updateBookDto.categoryId; // Eliminamos categoryId del DTO
    }

    // Actualizamos las propiedades del libro
    Object.assign(book, updateBookDto);
    await this.bookRepository.update(id, updateBookDto);
    return await this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.bookRepository.delete(id);
  }

  async saveBook(data: {
    title: string;
    editorial: string;
    codigo: string;
    filePath: string;
    author: string;
    categoryId: number;
  }) {
    const category = await this.categoryRepository.findOne({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${data.categoryId} no encontrada`,
      );
    }

    const newBook = this.bookRepository.create({
      title: data.title,
      editorial: data.editorial,
      codigo: data.codigo,
      file_path: data.filePath,
      author: data.author,
      category,
    });

    return await this.bookRepository.save(newBook);
  }

  //Servio para obtener todos los libros de la BD
  async getAllBooks() {
    return await this.bookRepository.find();
  }

  //Servicio buscar_libro por ID
  async findBookById(id: number) {
    const book = await this.bookRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    if (!book.file_path) {
      throw new BadRequestException(
        `El libro con ID ${id} no tiene un archivo asociado`,
      );
    }
    return book;
  }

  //Servicio eliminar libro por ID
  async remove(id: number): Promise<void> {
    const book = await this.bookRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException(`Libro con id ${id} no encontrado`);
    }

    // Eliminar el archivo del servidor si existe
    if (book.filePath) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(book.filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.bookRepository.remove(book);
  }

  async getRecentBooks() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
    return await this.bookRepository.find({
      where: {
        lastViewed: { $gte: oneMonthAgo }, // Para MongoDB
        // lastViewed: MoreThan(oneMonthAgo), // Para MySQL / Postgres
      },
    });
  }
  
}
