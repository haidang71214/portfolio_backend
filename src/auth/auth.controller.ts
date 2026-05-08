import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpCode, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Express } from 'express';
import { Response } from 'express';
import { CreateRegisterDto } from './dto/RegisterDto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from './stratergy/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryProvider } from '../cloudinary/cloundinary.provider';
import { CloudUploadService } from '../shared/cloudinary.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly cloudynaryService:CloudUploadService
  ) {}
@Post("login")
@HttpCode(200)
async Login(
  @Res() res:Response,
  @Body() body:CreateAuthDto
){
    const response = await this.authService.login(body);
    return res.json({response})
}
@Post('register')
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('img'))
async register(
  @Body() body:CreateRegisterDto,
  @Res() res : Response,
  @UploadedFile() file:  Express.Multer.File
){
  try {
    if(file){
      const res_images = this.cloudynaryService.uploadImage(file,"images");
      body.avatar_url =  (await res_images).secure_url;
    }
    const result = await this.authService.Register(body);
    return res.status(200).json({result})
  } catch (error) {
    return res.status(500).json({message:"Sever Errror"})
  }
}
@Post('forgotPass')
async forgotPassword(
  @Res() res:Response,
  @Body("email") email: string,
){
try {
  // Đổi tên biến này thành 'result' hoặc 'authRes'
    const result = await this.authService.forgotPassword(email);
    return res.status(200).json(result);
} catch (error) {
  return res.status(500).json({message:"Server Error"})
}
}
@Post('reset-pass')
async resetPassWord(
  @Res() res:Response,
  @Body("email") email:string,
  @Body("resetToken") resetToken:string,
  @Body("newPassWord") newPassword:string
){
    const result = await this.authService.resetPassword(email, resetToken, newPassword);
    return res.status(200).json(result);
}
@ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req) {
    const { id } = req.user;
    const result = await this.authService.LogoutService(id);
    return {
        message: "Logout successfully",
        result
    };
  }
}
