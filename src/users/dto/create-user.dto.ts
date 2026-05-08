import { IsEnum, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { UserRole } from "../../auth/dto/RegisterDto";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
   @IsString()
   @IsNotEmpty()
   email!:string;
   @IsString()
   @IsNotEmpty()
   password!:string;
   @IsEnum(UserRole)
   @IsNotEmpty()
   role!:UserRole;
   @ApiProperty({ type: 'string', format: 'binary',required:false })
   images?: any;
   @ApiHideProperty()
   avartar_url!: string;
}
