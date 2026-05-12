import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpCode, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/stratergy/jwt.guard';
import { RolesGuard } from '../auth/stratergy/role.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

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

@UseGuards(JwtAuthGuard, RolesGuard) // Thêm Guard vào đây
@Roles('admin')
  @Get()
  @HttpCode(200)
  async findAll() {
          return await this.usersService.findAll();
  }
@UseGuards(JwtAuthGuard, RolesGuard) // Thêm Guard vào đây
@Roles('admin')
  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string,@Res() res:Response) {
      const result = await this.usersService.findOne(id);
      return result
   
  }
  @UseGuards(JwtAuthGuard, RolesGuard) // Thêm Guard vào đây
  @Roles('admin')
  @Patch(':id')
  @HttpCode(200)
  async updateUser(
    @Param('id') id:string,
    @Res() res:Response,
    @Req() body:UpdateUserDto
  ){
    const result = await this.usersService.updateUser(id,body)
    return result;
  }

}
