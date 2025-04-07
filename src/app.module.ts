import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './features/users/users.module';
import { CategoriesModule } from './features/categories/categories.module';
import { RolesModule } from './features/roles/roles.module';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './features/books/books.module';
import { UploadModule } from 'uploads/upload.module';
import { JwtModule } from '@nestjs/jwt';
import { SavedBookModule } from './features/saved-book/saved-book.module';
/* import { SearchModule } from './features/search/search.module'; */

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
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
  /*     logging: true, */
    }),
    JwtModule.register({
      secret: 'tu_secreto_jwt', // Reemplaza con tu clave secreta JWT
      signOptions: { expiresIn: '1h' }, // Opciones de firma
    }),
    UsersModule,
    BooksModule,
    CategoriesModule,
    RolesModule,
    AuthModule,
    UploadModule,
    SavedBookModule,
/*     SearchModule, */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
