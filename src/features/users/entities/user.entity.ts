import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SavedBook } from 'src/features/saved-book/dto/entities/saved-book.entity';

export enum UserRole {
  ADMIN = 'admin',
  PARTNER = 'partner',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  puesto: string;

  @Column()
  area_adscripcion: string;

  @Column()
  sub_area: string;

  @Column()
  password: string;

  @OneToMany(() => SavedBook, (savedBook) => savedBook.user)
  savedBooks: SavedBook[]; // Relación con los libros guardados

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // por defecto, los usuarios seran 'users'
  })
  role: UserRole; // por defecto los usuarios serán 'user', el admin puede modificar roles para convertirlos en 'partner'

  @Column({ unique: true })
  publicId: string;

  @BeforeInsert()
  async generatePublicId() {
    if (!this.publicId) {
      const salt = await bcrypt.genSalt(5);
      this.publicId = await bcrypt.hash(this.username + Date.now(), salt);
      this.publicId = this.publicId.replace(/\W/g, '').substring(0, 15);
    }
  }
}
