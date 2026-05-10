import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { KeyService } from '../key/key.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateRegisterDto } from './dto/RegisterDto';
import { HashService } from '../hash/Hash.Service';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    private readonly jwtService : JwtService,
private readonly keyService : KeyService,
 private readonly mailService : EmailService,
     private readonly hash : HashService
  ){}
  // làm ở register,, login với reset pass.
  async login(createAuthDto: CreateAuthDto) {
      const {email,password} = createAuthDto;
      const findUser = await this.prisma.users.findFirst({where:{email}});
      if(!findUser){
        throw new Error("user đéo có trong hệ thống")
      }
      const checkPass = await bcrypt.compare(password,findUser.pass);
      if(!checkPass){
        throw new Error("sai pass rồi bé ơi")
      }
      // tạo access.
      const token = await this.jwtService.sign({data:{userId: findUser.id}}, { expiresIn: '1h',
          secret: this.keyService.getPrivateKey(),
          algorithm: 'RS256',});
        // tạo refToken ngay khi tạo access;.
      const refToken = this.jwtService.sign(
        { data: { userId: findUser.id } },
        {
          expiresIn: '7d',
          secret: this.keyService.getRefTokenPrivateKey(),
          algorithm: 'RS256',
        });
      await this.prisma.users.update({where:{id:findUser.id},data:{
    refresh_token:refToken
      }})
      const {pass,...result} = findUser
      return {
      token,
      refreshToken:refToken,
      user:result
    }
  }
  async LogoutService(id: string) {
    const findUser = await this.prisma.users.findFirst({where:{id:id}}) 
    if(!findUser){
      throw new Error("ôi trời ơi hong thấy user")
    }
  const res =  await this.prisma.users.update({where:{id:findUser.id},data:{
      refresh_token:null
    }})
  return {
    message:"logout success",
  }
  }

async forgotPassword(email: string) {
    const findUser = await this.prisma.users.findFirst({ where: { email } });
    if (!findUser) {
      return {
        status: 400,
        message: "hong tìm thấy user",
      };
    }
    const resetKey = uuidv4().slice(0, 7);
    const updateResetToken = await this.prisma.users.update({
      where: { id: findUser.id },
      data: {
        resetToken: resetKey , 
      },
    });
    await this.mailService.sendMail(
      updateResetToken.email,
      "Đây là mã reset:",
      updateResetToken.resetToken! 
    );

    // 4. Trả về kết quả thành công
    return {
      message: "Gửi mail thành công rồi nha!",
    };

  
}
// string thì có thể set state ở fe rồi truyền vào be nè.
  async resetPassword(email:string,resetToken:string,newPass:string){
    const newUser = await this.prisma.users.findFirst({where:{email}});
    if(!newUser)return{status:400,messsage:"Chắc sai gì đó"};
    if(newUser.email != email || newUser.resetToken != resetToken){
    return{message:"Ôi trời ơi sai cái gì kìa"}
    }
    const res = await this.prisma.users.update({where:{id:newUser.id},data:{
      pass:newPass
    }})
    const {pass,...results} = res;
    return{
      message:"Wao wao wao, ok rồi đó bé",
      data:results,
     } 
  }

 async  Register(heheeuser : CreateRegisterDto) {
    const findUser = await this.prisma.users.findFirst({where:{email:heheeuser.email}});
    if(findUser){
      return{
        message:"User này đã tồn tại"
      }
    }

    const newUser = await this.prisma.users.create({data:{
      email:heheeuser.email,
      pass:heheeuser.pass,
      major:heheeuser.major,
      role:"user",
      username:heheeuser.username
    }})
    const {pass,...result} = newUser;
    return {
      message:"Register Successful",
      data: result
    };
    } 
    async extendToken(){
      
    }
}
