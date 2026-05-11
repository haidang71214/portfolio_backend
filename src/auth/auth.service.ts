import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { KeyService } from '../key/key.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateRegisterDto } from './dto/RegisterDto';
import { HashService } from '../hash/Hash.Service';
import { Response } from 'express';
import { NotFoundError } from 'rxjs';
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
      const token = await this.jwtService.sign({data:{userId: findUser.id, role: findUser.role}}, { expiresIn: '1h',
          secret: this.keyService.getPrivateKey(),
          algorithm: 'RS256',});
        // tạo refToken ngay khi tạo access;.
      const refToken = this.jwtService.sign(
        { data: { userId: findUser.id,
       
         } },
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
      throw new NotFoundError("User not found")
    }
    await this.prisma.users.update({where:{id:findUser.id},data:{
      refresh_token:null
    }})
  return {
    message:"logout success",
  }
  }

async forgotPassword(email: string) {
    const findUser = await this.prisma.users.findFirst({ where: { email } });
    if (!findUser) {
      throw new NotFoundError("Không tim thấy user")
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
    const newUser = await this.prisma.users.findFirst({where:{email},select:{email:true,resetToken:true,id:true}});
    if(!newUser) throw new NotFoundError("Không tìm thấy yser");
    if(newUser.email != email || newUser.resetToken != resetToken){
      throw new BadRequestException("Sai resetToken")
    }
    const res = await this.prisma.users.update({where:{id:newUser.id,email,resetToken },data:{
      pass:newPass
    }})
    const {pass,...results} = res;
    return{
      data:results,
     } 
  }

 async  Register(heheeuser : CreateRegisterDto) {
    const findUser = await this.prisma.users.findFirst({where:{email:heheeuser.email}});
    if(findUser){
      throw new ConflictException("Email này đang được sử dụng")
    }
    const haspass = await bcrypt.hash(heheeuser.pass,10);
    const newUser = await this.prisma.users.create({data:{
     ...heheeuser,
      pass:haspass,
      role:"user"
    },select:{email:true,major:true,role:true,username:true}},)
    return {
      newUser
    };
    } 
async extendToken(refreshToken: string, res: Response) {
  
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    // 1. Verify token trước
    const payload = await this.jwtService.verify(refreshToken, {
      secret: this.keyService.getRefTokenPublicKey(), // Dùng Public Key để verify
      algorithms: ['RS256'],
    });

    // 2. Tìm user trong DB (Phải có await)
    const user = await this.prisma.users.findFirst({
      where: { id: payload.data.userId, refresh_token: refreshToken }
    });

    if (!user) return res.status(401).json({ message: "Invalid token" });

    // 3. Tạo Access Token mới
    const newAccessToken = await this.jwtService.sign(
      { data: { userId: user.id,
        role: user.role 
       } },
      {
        expiresIn: '1h',
        secret: this.keyService.getPrivateKey(),
        algorithm: 'RS256',
      }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
}

}
