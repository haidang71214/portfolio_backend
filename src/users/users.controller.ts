import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpCode, Req, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/stratergy/jwt.guard';
import { RolesGuard } from '../auth/stratergy/role.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { CloudUploadService } from '../shared/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly authService:AuthService,
  private readonly cloudynaryService:CloudUploadService
  ) {}
@Post()
@UseGuards(JwtAuthGuard, RolesGuard) // Thêm Guard vào đây
@ApiBearerAuth()
// á à đây còn chưa có images.
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('images')) // trường hứng.
@Roles('admin') // Dùng Decorator để đánh dấu chỉ Admin mới được vào
async create(@Body() createUserDto: CreateUserDto,
  @UploadedFile() file:  Express.Multer.File) {
        if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"images");
      createUserDto.avartar_url =  (await res_images).secure_url;
    }
  return await this.usersService.create(createUserDto);
}
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // Thêm Guard vào đây
@Roles('admin')
  @Get()
  @HttpCode(200)
  async findAll() {
          return await this.usersService.findAll();
  }
  @Get(':email')
  @HttpCode(200)
  async findOne(@Param('email') id: string) {
      const result = await this.usersService.findOne(id);
      return result
  }
  // tương tự, nhma hình như ở đây có các trường thừa.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard) // Thêm Guard vào đây
  @Roles('admin')
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('images'))
  @HttpCode(200)
  async updateUser(
    @Param('id') id:string,
    @Body() body:UpdateUserDto,
    @UploadedFile() file:  Express.Multer.File
  ){
// chỗ này có ảnh với haspass á, cẩn thận tí.
   if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"images");
      body.avartar_url =  (await res_images).secure_url;
    }
    const result = await this.usersService.updateUser(id,body)
    return result;
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Patch('me/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('images'))
  async updateMe(
    @Body() body:UpdateUserDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File 
  ){
     const { userId } = req.user;
    if (file) {
      const res_images = await this.cloudynaryService.uploadImage(file, "images");
      body.avartar_url = res_images.secure_url;
    }
    // 3. Gọi service và truyền đủ 2 tham số
    const result = await this.usersService.updateMyAccount(userId, body);
    return result;
  }
}
