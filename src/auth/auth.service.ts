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
import { ForgotPasswordDto } from './dto/ForgotPassDto';
import { ResetPasswordDto } from './dto/ResetPassDto';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    private readonly jwtService : JwtService,
private readonly keyService : KeyService,
 private readonly mailService : EmailService,
     private readonly hash : HashService
  ){}
  // làm ở register,, login với reset pass.
  private readonly userSafeSelect = {
   id: true,
      username: true,
      email: true,
      images_url: true,
      role: true,
      major: true,
      created_at: true,
  };
  async login(createAuthDto: CreateAuthDto) {
      const {email,password} = createAuthDto;
      const findUser = await this.prisma.users.findFirst({where:{email}});
      if(!findUser){
        throw new Error("user đéo có trong hệ thống")
      }
      const checkPass = await this.hash.comparePassword(password,findUser.pass);
      if(!checkPass){
        throw new Error("sai pass rồi bé ơi")
      }
      // tạo access.
      const token = await this.jwtService.sign({data:{userId: findUser.id, role: findUser.role}}, { expiresIn: '1h',
          secret: this.keyService.getPrivateKey(),
          algorithm: 'RS256',});
        // tạo refToken ngay khi tạo access;.
      const refToken = this.jwtService.sign(
        { data: { userId: findUser.id}},
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
    const findUser = await this.prisma.users.findUnique({where:{email:email}});
    if (!findUser) {
      throw new BadRequestException("Không tim thấy user")
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
  async resetPassword(reset : ResetPasswordDto){
    const newUser = await this.prisma.users.findFirst({where:{email:reset.email},select:{email:true,resetToken:true,id:true}});
    if(!newUser) throw new NotFoundError("Không tìm thấy yser");
    
    if(newUser.email != reset.email || newUser.resetToken != reset.resetToken){
      throw new BadRequestException("Sai resetToken")
    }
    const hehePas = await this.hash.hashPassword(reset.newPassWord);
    const res = await this.prisma.users.update({where:{id:newUser.id },data:{
      pass:hehePas
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
      const { avatar_url, images, ...userData } = heheeuser;
   const haspass = await this.hash.hashPassword(heheeuser.pass);
    const data = await this.prisma.users.create({data:{
   ...userData,      
      pass: haspass,
      images_url: avatar_url, 
      role: "user"
    },select:this.userSafeSelect},)
    return {
      data
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

    // 2. Tìm user trong DB và kiểm tra xem refreshToken có khớp không
    // Sử dụng findFirst vì id + refresh_token có thể không phải là composite unique key
    const user = await this.prisma.users.findFirst({
      where: { id: payload.data.userId, refresh_token: refreshToken }
    });

    if (!user) return res.status(401).json({ message: "Invalid token or already used" });

    // 3. Tạo Access Token mới
    const newAccessToken = await this.jwtService.sign(
      { data: { userId: user.id, role: user.role } },
      {
        expiresIn: '1h',
        secret: this.keyService.getPrivateKey(),
        algorithm: 'RS256',
      }
    );

    // 4. Tạo Refresh Token mới (Rotation)
    const newRefreshToken = await this.jwtService.sign(
      { data: { userId: user.id } },
      {
        expiresIn: '7d',
        secret: this.keyService.getRefTokenPrivateKey(),
        algorithm: 'RS256',
      }
    );

    // 5. Update Refresh Token mới vào DB
    await this.prisma.users.update({
      where: { id: user.id },
      data: { refresh_token: newRefreshToken }
    });

    // 6. Set lại Cookie Refresh Token mới cho trình duyệt
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true, // Thêm secure nếu dùng HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
}

}
