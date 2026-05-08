// user-response.dto.ts
import { Expose, Exclude } from 'class-transformer';
import { UserRole } from './RegisterDto';

export class UserResponseDto {
  @Expose()
  id!: number;

  @Expose()
  username!: string;

  @Expose()
  email!: string;

   @Expose()
   role!:UserRole;
}