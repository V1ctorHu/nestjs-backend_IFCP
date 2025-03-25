import {BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  findById(arg0: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async register(createUserDTO: CreateUserDto) {
    const { username, firstname, lastname, email, password, puesto, area_adscripcion} = createUserDTO;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Cifrar la contraseña
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario
    const newUser = this.userRepository.create({
      username,
      firstname,
      lastname,
      email,
      puesto,
      area_adscripcion ,
      password: hashedPassword,
      role: UserRole.USER,
    });

    await this.userRepository.save(newUser);

    // Generar token JWT
    const payload = { sub: newUser.publicId, role: newUser.role };
    const access_token = this.jwtService.sign(payload);

    return {
      message: 'Usuario registrado exitosamente',
      access_token,
      user: newUser,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUser(loginDto.email,loginDto.password,);

    if (!user) {
      throw new BadRequestException('Credenciales incorrectas');
    }
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'firstname', 'lastname', 'role'],
    });
  
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  /** token para recuperación de contraseña */
  async generateResetToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const payload = { sub: user.id, email: user.email };
    const resetToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const resetLink = `http://frontend.com/reset-password?token=${resetToken}`;
    console.log(`Enlace de recuperación: ${resetLink}`);

    return { resetToken, resetLink };
  }

  /** restablecer contraseña */
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
      await this.userRepository.save(user);

      return { message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      throw new BadRequestException('Token inválido o expirado');
    }
  }
}
