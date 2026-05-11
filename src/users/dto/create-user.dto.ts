import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserMajor, UserRole } from "../../auth/dto/RegisterDto";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
   @IsString()
   @IsNotEmpty()
   @ApiProperty()
   email!:string;
   @IsString()
   @IsNotEmpty()
   @ApiProperty()
   password!:string;
   @IsEnum(UserRole)
   @IsNotEmpty()
   @ApiProperty()
   role!:UserRole;
   @ApiProperty({ type: 'string', format: 'binary',required:false })
   images?: any;
   @ApiHideProperty()
   avartar_url!: string;
   @IsEnum(UserMajor)
   @ApiProperty()
   major!:UserMajor
   @IsString()
   @ApiProperty()
   username!:string
}
