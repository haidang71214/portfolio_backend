import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

// Enum đúng theo bảng DB của bạn
export enum UserMajor {
  IT = 'it',
  JOURNALIST = 'journalist',
  DESIGNER = 'designer',
  OTHER = 'other',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class CreateRegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Username không được để trống' })
  @MaxLength(20)
  username!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  @MaxLength(100)
  pass!: string;

  @IsEnum(UserMajor, { message: 'Ngành nghề phải là: it, journalist, designer hoặc other' })
  @IsNotEmpty()
  major!: UserMajor;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
// tạm thời chưa động cái này.
//   @IsUrl({}, { message: 'URL ảnh không hợp lệ' })
//   @IsOptional() // Trường này có thể không cần gửi lúc đăng ký
//   images_url?: string;
}