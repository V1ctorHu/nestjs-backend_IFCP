import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './features/users/users.module';
import { BooksModule } from './features/books/books.module';
import { CategoriesModule } from './features/categories/categories.module';
import { RolesModule } from './features/roles/roles.module';
import { AuthModule } from './features/auth/auth.module';
import { UploadModule } from '../uploads/upload.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3316,
      username: 'root',
      password: '',
      database: 'biblioteca_digital',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    BooksModule,
    CategoriesModule,
    RolesModule,
    AuthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
