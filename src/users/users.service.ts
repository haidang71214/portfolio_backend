import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../hash/Hash.Service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma : PrismaService,
    private readonly hasCode : HashService,
  ){}

  async create(createUserDto: CreateUserDto) {
  // nhớ mã hóa lại cái pass
    if(await this.prisma.users.findFirst({where:{email:createUserDto.email}}) ){
      return {message:"Email đã tồn tại trong hệ thống"};
    }
    const res = await  this.prisma.users.create({data:{
      email:createUserDto.email,
      images_url:createUserDto.avartar_url || null,
      pass : await this.hasCode.hashPassword(createUserDto.password),
      role:createUserDto.role,
      major:createUserDto.major,
      username:createUserDto.username
    }})
    const {pass,...result} = res;
    return {result}
  }

   async findAll(){
    const userList = await this.prisma.users.findMany({select:{
      username:true,
      images_url:true,
      role:true,

    }});
    // khi findmany, nên dùng cái này để nó 
    if(!userList)return{message:"Không nó nổi 1 user để tìm"}
    return userList;
    
  }

  async findOne(id: string) {
  const user = await this.prisma.users.findUnique({
    where: { id: id },
    select: { // Thêm select vào đây
      id: true,
      username: true,
      email: true,
      images_url: true,
      role: true,
      major: true,
      created_at: true,
    }
  });
  
  if (!user) throw new NotFoundException("Không có user này đâu bé ơi");
  return user;
}

}
