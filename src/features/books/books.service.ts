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
import { Like, MoreThan, Repository } from 'typeorm';
import path from 'path';
import fs from 'fs';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async saveBook(
    createBookDto: CreateBookDto,
    file_path: string,
  ): Promise<Book> {
    const { title, editorial, codigo, author, categoryId } = createBookDto;

    // Validar que todos los campos obligatorios estén presentes
    if (!title || !editorial || !codigo || !author) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    // Buscar la categoría asociada
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${categoryId} no encontrada`,
      );
    }

    // Crear el libro
    const newBook = this.bookRepository.create({
      title,
      editorial,
      codigo,
      author,
      category,
      file_path: file_path,
    });

    return await this.bookRepository.save(newBook);
  }

  // Obtener todos los libros con sus categorías
  async findAll(): Promise<Book[]> {
    return await this.bookRepository.find({ relations: ['category'] });
  }

  // Obtener un libro por ID
  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return book;
  }

  async updateBook(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    // Actualizar los campos del libro
    book.title = updateBookDto.title ?? book.title;
    book.author = updateBookDto.author ?? book.author;
    book.editorial = updateBookDto.editorial ?? book.editorial;
    book.codigo = updateBookDto.codigo ?? book.codigo;

    // Asociar la categoría
    if (updateBookDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateBookDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${updateBookDto.categoryId} no encontrada`,
        );
      }

      book.category = category; // Asociar la categoría al libro
    }

    return this.bookRepository.save(book); // Guardar los cambios en la base de datos
  }

  async delete(id: number): Promise<void> {
    await this.bookRepository.delete(id);
  }

  // los libros con URL del PDF
  async getAllBooks() {
    const books = await this.bookRepository.find();
    return books.map((book) => ({
      ...book,
      pdfUrl: `http://localhost:3000/${book.file_path}`,
    }));
  }

  // buscar un libro por ID
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

  // Obtener libros por categoría
  async findByCategory(categoryId: number): Promise<Book[]> {
    const books = await this.bookRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category'],
    });

    if (!books.length) {
      throw new NotFoundException(
        `No hay libros en la categoría con ID ${categoryId}`,
      );
    }
    return books;
  }

  // Obtener libros vistos recientemente (último mes)
  async getRecentBooks() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const books = await this.bookRepository.find({
      where: { createdAt: MoreThan(oneMonthAgo) },
      order: { createdAt: 'DESC' },
      take: 12,
      relations: ['category'],
    });

    return books.map((book) => ({
      ...book,
      pdfUrl: `http://localhost:3000/${book.file_path}`,
    }));
  }

  async searchBooksByTitle(query: string): Promise<Book[]> {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return [];

    const books = await this.bookRepository.find({
      where: { title: Like(`%${searchTerm}%`) }, // LIKE para búsquedas parciales
      relations: ['category'], // relaciones si es necesario
    });

    return books.map((book) => ({
      ...book,
      pdfUrl: book.file_path ? `http://localhost:3000/${book.file_path}` : null,
    }));
  }

  // Función de normalización
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  }

  async updateLastViewed(bookId: number): Promise<void> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${bookId} no encontrado`);
    }
    book.lastViewed = new Date(); // Actualiza la fecha de última visualización
    await this.bookRepository.save(book);
  }

}
