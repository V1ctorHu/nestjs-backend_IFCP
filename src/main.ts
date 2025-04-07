import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // frontend Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const uploadsPath = path.resolve(__dirname, '..','..', 'uploads'); // Ruta absoluta
  console.log('Ruta de uploads:', uploadsPath);

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });
  
  await app.listen(3000);
}
bootstrap();
