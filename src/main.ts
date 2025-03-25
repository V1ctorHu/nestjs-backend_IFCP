import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // frontend Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  app.use('/uploads/books', express.static(join(__dirname, '..', 'uploads/books')));
  app.use('/uploads/thumbnails', express.static(join(__dirname, '..', 'uploads/thumbnails')));
  
  await app.listen(3000);
}
bootstrap();
