import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { SavedBooksService } from './saved-books.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('saved-books')
/* @UseGuards(AuthGuard('jwt')) */
export class SavedBooksController {
  constructor(private readonly savedBooksService: SavedBooksService) {}

  @Post(':bookId')
  @UseGuards(AuthGuard('jwt')) // Proteger la ruta con autenticación JWT
  async saveBook(@Param('bookId') bookId: number, @Req() req): Promise<void> {
    const userId = req.user.sub; // Obtener el ID del usuario autenticado
    await this.savedBooksService.saveBook(userId, bookId);
  }

  @Get()
  async getAllUsersWithSavedBooks(): Promise<any[]> {
    return this.savedBooksService.getAllUsersWithSavedBooks();
  }

  @Delete(':bookId')
  @UseGuards(AuthGuard('jwt'))
  async removeSavedBook(
    @Param('bookId') bookId: number,
    @Req() req,
  ): Promise<void> {
    try {
      const userId = req.user.sub; // Obtener el ID del usuario autenticado
      await this.savedBooksService.removeSavedBook(userId, bookId);
    } catch (error) {
      console.error('Error al eliminar el libro guardado:', error.message);
      throw new NotFoundException('Libro guardado no encontrado');
    }
  }

   @Get('users-saved-books')
  async getUsersWithSavedBooks() {
    return this.savedBooksService.getUsersWithSavedBooks();
  } 

  @Get('user/:userId')
  async getSavedBooksByUserId(@Param('userId') userId: number) {
    return this.savedBooksService.getSavedBooksByUserId(userId);
  }

  @Get('is-saved/:bookId')
  @UseGuards(AuthGuard('jwt'))
  async isBookSaved(
    @Param('bookId') bookId: number,
    @Req() req,
  ): Promise<boolean> {
    const userId = req.user.sub; // Obtener el ID del usuario autenticado
    const savedBook = await this.savedBooksService.isBookSaved(userId, bookId);
    return !!savedBook;
  }
}
