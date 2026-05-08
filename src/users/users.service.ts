import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../hash/Hash.Service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma : PrismaService,
    private readonly hasCode : HashService
  ){}
  async create(createUserDto: CreateUserDto) {
  // nhớ mã hóa lại cái pass
    const res = this.prisma.users.create({data:{
      email:createUserDto.email,
      images_url:createUserDto.avartar_url || null,
      pass : await this.hasCode.hashPassword(createUserDto.password),
      role:createUserDto.role,
      major:createUserDto.major,
      username:createUserDto.username
    }})
    return 
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
