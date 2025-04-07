/* import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { BooksService } from '../books/books.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService, private booksService:BooksService) {}

  @Get()
  async searchBooksByTitle(@Query('query') query: string) {
    console.log('Término de búsqueda recibido:', query);
    if (!query || query.trim() === '') {
      return []; // Devuelve una lista vacía si no hay término de búsqueda
    }
    return this.booksService.searchBooksByTitle(query);
  }
} */