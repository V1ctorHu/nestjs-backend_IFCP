import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Category } from 'src/features/categories/entities/category.entity';
import { SavedBook } from 'src/features/saved-book/dto/entities/saved-book.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => SavedBook, (savedBook) => savedBook.book)
  savedByUsers: SavedBook[]; // Relación con los usuarios que guardaron este libro

  @Column()
  title: string;

  @Column()
  editorial: string;

  @Column({ nullable: true })
  author: string;

  @ManyToOne(() => Category, (category) => category.books)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ name: 'code', unique: true }) 
  codigo: string;

  @Column()
  file_path: string; // Almacena la ruta del archivo subido

  @Column({ type: 'timestamp', nullable: true, default: null })
  lastViewed: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP', //  se asigna la fecha actual al crear el registro
  })
  createdAt: Date;
}