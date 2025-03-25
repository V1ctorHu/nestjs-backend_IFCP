import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

@Post('register')
async register(@Body() createUserDto: CreateUserDto) {
  return this.authService.register(createUserDto);
}

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

  @UseGuards(JwtAuthGuard) 
  @Get('profile')
  getProfile(@Req() req) {
    return this.authService.getProfile(req.user.sub);
  }
}
