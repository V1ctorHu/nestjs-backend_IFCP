import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from 'src/features/categories/entities/category.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

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
}