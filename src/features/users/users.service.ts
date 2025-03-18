import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto){
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // hasheando la contraseña
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword, // contraseña encriptada
    });
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); //  el usuario existe?
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id); // devuelve el usuario actualizado
  }

  async remove(id: number){
    await this.findOne(id); //  el usuario existe?
    await this.userRepository.delete(id);
  }

  async findAllWithIndex() {
    const users = await this.userRepository.find();
    const usersWithIndex = users.map((user, index) => ({
      index: index + 1, // lista de números consecutivos
      ...user,
    }));
    return usersWithIndex;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Datos  incorrectos');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Datos incorrectos');
    }

    const { password: _, ...result } = user; // Excluimos la contraseña en la respuesta
    return result;
  }

}
