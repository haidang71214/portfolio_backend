import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'Email của người dùng cần reset' 
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ 
    example: '1234567', 
    description: 'Mã reset đã gửi qua email' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã reset không được để trống' })
  resetToken: string;

  @ApiProperty({ 
    example: 'newpassword123', 
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassWord: string; // Lưu ý: Mình đặt đúng tên 'newPassWord' như bạn viết ở Controller
}
