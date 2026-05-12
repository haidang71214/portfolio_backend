import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpCode, UseGuards, UseInterceptors, UploadedFile, HttpException } from '@nestjs/common';
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
import { HashService } from '../hash/Hash.Service';
import { ForgotPasswordDto } from './dto/ForgotPassDto';
import { ResetPasswordDto } from './dto/ResetPassDto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly cloudynaryService:CloudUploadService,

  ) {}
@Post("login")
@HttpCode(200)
async Login(
  @Res() res:Response,
  @Body() body:CreateAuthDto
){
    const response = await this.authService.login(body);
    res.cookie('refreshToken', response.refreshToken, {
    httpOnly: true, 
    maxAge: 7 * 24 * 60 * 60 * 1000 
});

    return res.json({response})
}
@Post('register')
@HttpCode(200)
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('images'))
async register(
  @Body() body:CreateRegisterDto,
  @Res() res : Response,
  @UploadedFile() file:  Express.Multer.File
){
    if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"images");
      body.avatar_url =  (await res_images).secure_url;
    }
    const result = await this.authService.Register(body);
    return res.status(200).json({result})
  
}
@Post('forgotPass')
@HttpCode(200)
async forgotPassword(
  @Body() body: ForgotPasswordDto,
){

  // Đổi tên biến này thành 'result' hoặc 'authRes'
    const result = await this.authService.forgotPassword(body.email);
    return result

}
@Post('reset-pass')
@HttpCode(200)
async resetPassWord(
  @Res() res:Response,
  @Body() resetPasswordDto: ResetPasswordDto 
){
    const result = await this.authService.resetPassword(resetPasswordDto);
    return result
}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req) {
    const { userId } = req.user;
    const result = await this.authService.LogoutService(userId);
    return {
        result
    };
  }
  @Post('extend-token')
  @HttpCode(200)
  async refreshToken(@Res() res:Response,
@Req()req
)
  {
        const refreshToken  = req.cookies?.refreshToken;
      const result = await this.authService.extendToken(refreshToken,res);
      return result 
  
  }
}
