import { ConflictException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../hash/Hash.Service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma : PrismaService,
    private readonly hasCode : HashService,
  ){}
public readonly userSafeSelect = {
   id: true,
      username: true,
      email: true,
      images_url: true,
      role: true,
      major: true,
      created_at: true,
  };
  async create(createUserDto: CreateUserDto) {
  // nhớ mã hóa lại cái pass
    if(await this.prisma.users.findFirst({where:{email:createUserDto.email}}) ){
      throw new ConflictException("Email Already Exitst")
    }
    const res = await  this.prisma.users.create({data:{
      email:createUserDto.email,
      images_url:createUserDto.avartar_url || null,
      pass : await this.hasCode.hashPassword(createUserDto.password),
      role:createUserDto.role,
      major:createUserDto.major,
      username:createUserDto.username
    },select:this.userSafeSelect})
    return res
  }

   async findAll(){
    const userList = await this.prisma.users.findMany({select:this.userSafeSelect});
    // khi findmany, nên dùng cái này để nó 
    if(!userList)
      throw new NotFoundException("Yea, Not have user yet")
    return userList;
    
  }

  async findOne(id: string) {
  const user = await this.prisma.users.findUnique({
    where: { id: id },
    select: this.userSafeSelect
  });
  
  if (!user) throw new NotFoundException("Không có user này đâu bé ơi");
  return user;
}

 async updateUser(id:string,createuserDto : UpdateUserDto){
  const res = await this.prisma.users.update({where:{id},data:{
    ...createuserDto
  },select:this.userSafeSelect})
  return res;
 }
}
