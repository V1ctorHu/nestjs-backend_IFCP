import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  PARTNER = 'partner',
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
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // por defecto, los usuarios seran 'users'
  })
  role: UserRole; // por defecto los usuarios serán 'user', el admin puede modificar roles para convertirlos en 'partner'
}
