import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UnauthorizedException, UseGuards,} from '@nestjs/common';
import { Roles } from 'src/features/roles/roles.decorator';
import { UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { LoginDto } from '../auth/dto/login.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

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
        username: user.username || 'Usuario sin nombre',
      },
    };
  }

/*   @Roles(UserRole.ADMIN, UserRole.PARTNER) */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

/*   @Roles(UserRole.ADMIN) */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
/* 
  @Put(':id/promote')
  async promoteToPartner(@Param('id') userId: number) {
    return this.usersService.promoteToPartner(userId);
  }

  @Put(':id/demote')
  async demoteToUser(@Param('id') userId: number) {
    return this.usersService.demoteToUser(userId);
  } */

  @Get('manage-users')
  getManageUsersPage() {
    return {
      message: 'Acceso permitido a la vista de gestión de usuarios',
    };
  }
}
