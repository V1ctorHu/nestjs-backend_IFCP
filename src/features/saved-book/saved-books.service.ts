import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { SavedBook } from './dto/entities/saved-book.entity';

@Injectable()
export class SavedBooksService {
  constructor(
    @InjectRepository(SavedBook)
    private readonly savedBookRepository: Repository<SavedBook>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveBook(userId: number, bookId: number): Promise<void> {
    const user = { id: userId } as User;
    const book = await this.bookRepository.findOne({ where: { id: bookId } });

    if (!book) {
      throw new Error('Libro no encontrado');
    }

    const savedBook = this.savedBookRepository.create({ user, book });
    await this.savedBookRepository.save(savedBook);
  }

  async getSavedBooks(userId: number): Promise<any[]> {
    try {
      const savedBooks = await this.savedBookRepository.find({
        where: { user: { id: userId } },
        relations: ['book'], // Asegúrate de incluir la relación con el libro
      });

      if (!savedBooks || savedBooks.length === 0) {
        return [];
      }
  
      return savedBooks.map((savedBook) => ({
        ...savedBook.book,
        pdfUrl: `http://localhost:3000/${savedBook.book.file_path}`,
      }));

    } catch (error) {
      console.error('Error al obtener los libros guardados:', error);
      throw new Error('Error interno al obtener los libros guardados');
    }
  }

  async removeSavedBook(userId: number, bookId: number): Promise<void> {
    const savedBook = await this.savedBookRepository.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
      relations: ['user', 'book'],
    });

    if (!savedBook) {
      console.error(`Libro guardado no encontrado para userId=${userId}, bookId=${bookId}`);
      throw new Error('Libro guardado no encontrado');
    }
    console.log(`Eliminando libro guardado:`, savedBook);
    await this.savedBookRepository.remove(savedBook);
  }

  async getUsersWithSavedBooks() {
    try {
      const users = await this.userRepository.find({
        relations: ['savedBooks', 'savedBooks.book'],
      });

      return users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        savedBooks: user.savedBooks.map((savedBook) => ({
          bookId: savedBook.book.id,
          title: savedBook.book.title,
          author: savedBook.book.author,
          pdfUrl: savedBook.book.file_path
            ? `http://localhost:3000/${savedBook.book.file_path}`
            : null, // Construir la URL si file_path existe
        })),
      }));
    } catch (error) {
      console.error('Error al obtener usuarios con libros guardados:', error);
      throw new Error('Error interno al obtener usuarios con libros guardados');
    }
  }

  async getSavedBooksByUserId(userId: number): Promise<any[]> {
    try {
      const savedBooks = await this.savedBookRepository.find({
        where: { user: { id: userId } }, // Filtrar por el ID del usuario
        relations: ['book'], // Incluir la relación con el libro
      });

      if (!savedBooks || savedBooks.length === 0) {
        throw new Error('No se encontraron libros guardados para este usuario');
      }

      return savedBooks.map((savedBook) => ({
        bookId: savedBook.book.id,
        title: savedBook.book.title,
        author: savedBook.book.author,
        pdfUrl: savedBook.book.file_path
          ? `http://localhost:3000/${savedBook.book.file_path}`
          : null, // Construir la URL si file_path existe
      }));
    } catch (error) {
      console.error('Error al obtener los libros guardados:', error);
      throw new Error('Error interno al obtener los libros guardados');
    }
  }

  async getAllUsersWithSavedBooks(): Promise<any[]> {
    const users = await this.userRepository.find({
      relations: ['savedBooks', 'savedBooks.book'], // Incluir las relaciones necesarias
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      savedBooks: user.savedBooks.map((savedBook) => ({
        bookId: savedBook.book.id,
        title: savedBook.book.title,
        author: savedBook.book.author,
        pdfUrl: savedBook.book.file_path
          ? `http://localhost:3000/${savedBook.book.file_path}`
          : null,
      })),
    }));
  }

  async isBookSaved(userId: number, bookId: number): Promise<SavedBook | null> {
    return this.savedBookRepository.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
    });
  }
}
