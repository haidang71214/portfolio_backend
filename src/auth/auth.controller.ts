import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Response } from 'express';
import { CreateRegisterDto } from './dto/RegisterDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
@Post("login")
async Login(
  @Res() res:Response,
  @Body() body:CreateAuthDto
){
  try {
    const response = this.authService.login(body);
    return res.status(200).json({response})
  } catch (error) {
    return res.status(500).json({message:error})
  }
}
@Post('register')
async register(
  @Body() body:CreateRegisterDto,
  @Res() res : Response
){
  try {
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
}
