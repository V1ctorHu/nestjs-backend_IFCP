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
} from '@nestjs/common';
import { RolesGuard } from 'src/features/roles/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
@UseGuards(RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /* @Roles(UserRole.ADMIN, UserRole.PARTNER) */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/books',
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
        const allowedTypes = ['application/pdf', 'application/epub+zip'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Formato no permitido. Solo PDF.'), false);
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      title: string;
      editorial: string;
      codigo: string;
      author: string;
      categoryId: number;
    },
  ) {
    if (!file) throw new BadRequestException('No se pudo subir el archivo');
    if (!body.title || !body.editorial || !body.codigo) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    const book = await this.booksService.saveBook({
      title: body.title,
      editorial: body.editorial,
      codigo: body.codigo,
      filePath: file.path,
      author: body.author,
      categoryId: body.categoryId,
    });

    return { message: 'Archivo subido correctamente', book, fileName : path.basename(file.path) };
  }

  /*  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.PARTNER) */
  @Get()
  async getAllBooks() {
    return this.booksService.getAllBooks();
  }
  
  @Get('recent')
  getRecentBooks() {
    return this.booksService.getRecentBooks();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.booksService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateBookDto: UpdateBookDto) {
    return await this.booksService.update(id, updateBookDto);
  }

  @Get('download/:id')
  async downloadBook(@Param('id') id: number, @Res() res: Response) {
    const book = await this.booksService.findBookById(+id);
    console.log('Libro encontrado:', book);
    if (!book) {
      throw new NotFoundException(`Libro con id ${id} no encontrado`);
    }

    if (!book.file_path) {
      throw new BadRequestException(
        `El libro con ID ${id} no tiene un archivo asociado`,
      );
    }

    const filePath = path.resolve(__dirname, '../../../', book.file_path); // Asegura que la ruta es válida
    console.log('Ruta del archivo:', filePath); // 🔍 Verifica la ruta del archivo

    const fileName = path.basename(book.file_path);

    return res.download(filePath, (err) => {
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

    await this.booksService.remove(id);
    return res.status(200).json({ message: 'Libro eliminado correctamente' });
  }
}
