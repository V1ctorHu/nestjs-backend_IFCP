import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import * as request from 'supertest';


@Controller('auth')
export class AuthController {

constructor(private readonly authService: AuthService) {}

  @Post('login')  // <--- Define la ruta como /auth/login
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('request-reset')
  async requestReset(@Body('email') email: string) {
    const response = await this.authService.generateResetToken(email);
    return { message: 'Se ha enviado un enlace de recuperación al correo', ...response };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string}) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
