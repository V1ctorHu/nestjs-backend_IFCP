import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
      ignoreExpiration: false, // No ignora la expiración del token
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret', // Clave secreta para validar el token
    });
  }

  async validate(payload: any) {
    // Busca al usuario en la base de datos usando el ID del payload
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado'); // Lanza un error si el usuario no existe
    }

    // Devuelve el usuario completo para que esté disponible en req.user
    return {
      sub: user.id, // ID del usuario
      username: user.username, // Nombre de usuario
      role: user.role, // Rol del usuario
      email: user.email, // Correo electrónico (opcional)
    };
  }
}