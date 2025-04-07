import { Book } from 'src/features/books/entities/book.entity';
import { User } from 'src/features/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class SavedBook {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.savedBooks)
  user: User; // Relación con el usuario

  @ManyToOne(() => Book, (book) => book.savedByUsers)
  book: Book; // Relación con el libro

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}