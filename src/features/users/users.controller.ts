import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/features/roles/roles.decorator';
import { RolesGuard } from 'src/features/roles/roles.guard';
import { UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { LoginDto } from '../auth/dto/login.dto';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAllWithIndex();
  }

  @Get(':id') //GET WHIT ID
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post('register')
  async createUser(@Body() CreateUserDto: CreateUserDto) {
    return this.usersService.create(CreateUserDto);
  }

  @Post('login')
  async Login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Los datos ingresados son incorrectos');
    }
    return {
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Roles(UserRole.ADMIN)
  @Put('promote/:id')
  async promoteUserToPartner(@Param('id') userId: number) {
    const user = await this.usersService.findOne(userId);
    user.role = UserRole.PARTNER;
    await this.usersService.update(userId, user);
    return ` Usuario con ID ${userId} ahora es Partner`;
  }
}
