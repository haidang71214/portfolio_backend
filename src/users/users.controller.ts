import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpCode, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/stratergy/jwt.guard';
import { RolesGuard } from '../auth/stratergy/role.guard';
import { Roles } from '../auth/decorator/role.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly authService:AuthService ) {}
@Post()
@UseGuards(JwtAuthGuard, RolesGuard) // Thêm Guard vào đây
@Roles('admin') // Dùng Decorator để đánh dấu chỉ Admin mới được vào
async create(@Body() createUserDto: CreateUserDto) {
  return await this.usersService.create(createUserDto);
}


  @Get()
  @HttpCode(200)
  async findAll() {
          return await this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string,@Res() res:Response) {
      const result = await this.usersService.findOne(id);
      return result
   
  }


}
