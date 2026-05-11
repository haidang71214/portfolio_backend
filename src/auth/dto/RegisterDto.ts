import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  username!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  @MaxLength(100)
  @ApiProperty()
  pass!: string;

  @IsEnum(UserMajor, { message: 'Ngành nghề phải là: it, journalist, designer hoặc other' })
  @IsNotEmpty()
  @ApiProperty()
  major!: UserMajor;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @ApiProperty()
  role!: UserRole;
  @ApiProperty({type:'string',format:'binary',required:false})
  images?:any;
  @ApiHideProperty()
  avatar_url?:string;
}