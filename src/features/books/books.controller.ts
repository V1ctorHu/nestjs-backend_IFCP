import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Query,
  HttpException,
  HttpStatus,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dto/update-book.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('books')
@UseGuards(RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.resolve(process.cwd(), 'uploads', 'books');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const bookTitle = req.body.title || 'sin-titulo';
          const cleanTitle = bookTitle
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-');
          const fileExt = path.extname(file.originalname);
          const timestamp = Date.now();
          const uniqueFilename = `${cleanTitle}-${timestamp}${fileExt}`;
          cb(null, uniqueFilename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Formato no permitido. Solo PDF.'), false);
        }
      },
    }),
  )

  //Agragra un nuevo archivo
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      title: string;
      editorial: string;
      codigo: string;
      author: string;
      categoryId: number;
    },
  ) {
    console.log('Archivo recibido:', file);
    console.log('Datos del cuerpo:', body);

    if (!file) throw new BadRequestException('No se pudo subir el archivo');

    // Generar la ruta relativa usando barras invertidas (\) para Windows
    const filePathRelative = path
      .join('uploads', 'books', file.filename)
      .replace(/\\/g, '/');

    try {
      const book = await this.booksService.saveBook(
        {
          title: body.title,
          editorial: body.editorial,
          codigo: body.codigo,
          author: body.author,
          categoryId: body.categoryId,
        },
        filePathRelative, // Pass the file path as the second argument
      );

      return {
        message: 'Archivo subido correctamente',
        book,
        fileName: file.filename,
      };
    } catch (error) {
      console.error('Error al guardar el libro:', error);
      throw new HttpException(
        'Error interno al guardar el libro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('update-last-viewed/:bookId')
  async updateLastViewed(@Param('bookId') bookId: string): Promise<void> {
    const parsedBookId = parseInt(bookId, 10);
    if (isNaN(parsedBookId)) {
      throw new BadRequestException('El ID del libro debe ser un número válido');
    }
    return this.booksService.updateLastViewed(parsedBookId);
  }

  @Get()
  async getAllBooks() {
    return this.booksService.getAllBooks();
  }

  @Get('recent')
  getRecentBooks() {
    return this.booksService.getRecentBooks();
  }


  @Get('category/:categoryId')
  async getBooksByCategory(@Param('categoryId') categoryId: number) {
    return await this.booksService.findByCategory(categoryId);
  }

  @Get('search')
  async searchBooksByTitle(@Query('query') query: string) {
    console.log('Término de búsqueda recibido:', query);
    if (!query || query.trim() === '') {
      return [];
    }
    return this.booksService.searchBooksByTitle(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.booksService.findOne(id);
  }

  @Put(':id')
  async updateBook(
    @Param('id') id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<any> {
    try {
      const updatedBook = await this.booksService.updateBook(id, updateBookDto);
      return { message: 'Libro actualizado exitosamente', book: updatedBook };
    } catch (error) {
      console.error('Error al actualizar el libro:', error);
      throw new InternalServerErrorException(
        'Error interno al actualizar el libro',
      );
    }
  }

  @Get('download/:id')
  async downloadBook(@Param('id') id: string, @Res() res: Response) {
    const bookId = parseInt(id, 10); // Convertir el ID a número
    if (isNaN(bookId)) {
      throw new BadRequestException(`ID de libro inválido: ${id}`);
    }

    const book = await this.booksService.findBookById(bookId);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${bookId} no encontrado`);
    }

    if (!book.file_path) {
      throw new BadRequestException(
        `El libro con ID ${bookId} no tiene un archivo asociado`,
      );
    }
    const file_path = path.resolve(process.cwd(), book.file_path);

    // Verificar si el archivo existe
    if (!fs.existsSync(file_path)) {
      console.error(`El archivo no existe: ${file_path}`);
      throw new NotFoundException(`No se pudo descargar el archivo`);
    }

    const fileName = path.basename(book.file_path);

    // Forzar la descarga del archivo con el título del libro
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(book.title)}.pdf"`,
    );

    return res.sendFile(file_path, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        throw new NotFoundException(`No se pudo descargar el archivo`);
      }
    });
  }

  @Delete(':id')
  async deleteBook(@Param('id') id: number, @Res() res: Response) {
    const book = await this.booksService.findOne(id);
    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    // Eliminar archivo del servidor
    if (book.file_path) {
      const filePath = path.resolve(__dirname, '../../../', book.file_path);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Error al eliminar archivo:', err);
      }
    }

    await this.booksService.delete(id);
    return res.status(200).json({ message: 'Libro eliminado correctamente' });
  }

  //subir multiples libros

  @Post('upload-batch')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.resolve(process.cwd(), 'uploads', 'books');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const cleanTitle = file.originalname
            .replace(/\.[^/.]+$/, '') // Elimina la extensión del archivo
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-');
          const timestamp = Date.now();
          const uniqueFilename = `${cleanTitle}-${timestamp}${path.extname(file.originalname)}`;
          cb(null, uniqueFilename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Formato no permitido. Solo PDF.'), false);
        }
      },
    }),
  )
  async uploadBatch(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('categoryId') categoryId: number,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No se subieron archivos.');
      }

      const uploadedBooks = await Promise.all(
        files.map(async (file) => {
          const filePathRelative = path
            .join('uploads', 'books', file.filename)
            .replace(/\\/g, '/');
          const bookTitle = this.extractTitleFromFilename(file.originalname);

          return this.booksService.saveBook(
            {
              title: bookTitle,
              editorial: 'Editorial por defecto',
              codigo: this.generateUniqueCode(),
              author: 'Autor por defecto',
              categoryId: categoryId,
            },
            filePathRelative,
          );
        }),
      );

      return {
        message: `${uploadedBooks.length} libros subidos correctamente`,
        books: uploadedBooks,
      };
    } catch (error) {
      console.error('Error al subir los libros:', error);
      throw new HttpException(
        'Error interno al subir los libros',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private extractTitleFromFilename(filename: string): string {
    // quita extensión del archivo
    let cleanTitle = filename.replace(/\.[^/.]+$/, '');

    // quita números y caracteres especiales (excepto letras y espacios)
    cleanTitle = cleanTitle.replace(/[^a-zA-Z\s]/g, '');

    // reemplaza mas de 2 espacios por un solo espacio
    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

    // mayusculas para las iniciales de cada palabra
    cleanTitle = cleanTitle
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return cleanTitle;
  }

  private generateUniqueCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase(); // Genera un código único
  }
}
