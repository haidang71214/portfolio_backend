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
  // admin update
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    if (updateUserDto.avartar_url) {
         // ở đây thì nó sẽ tạo ra 1 trường "thừa" là avatar_url
      data.images_url = updateUserDto.avartar_url;
    }
    // việc mình xóa trường thừa ở đây, là để mình nhét data vào update ở dưới mà không có cản trở về mặt ts
    // đồn thời sẽ tiết kiệm ram khá nhiều 
    delete data.avartar_url;
    if (updateUserDto.password) {
    data.pass = await this.hasCode.hashPassword(updateUserDto.password);
    }
    delete data.password;
    // Xóa trường images nếu có (trường này dùng để upload file)
    delete data.images;
    const res = await this.prisma.users.update({
      where: { id },
      data,
      select: this.userSafeSelect
    });
    return res;
  }

  async updateMyAccount(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    if (updateUserDto.avartar_url) {
         // ở đây thì nó sẽ tạo ra 1 trường "thừa" là avatar_url
      data.images_url = updateUserDto.avartar_url;
    }
    // việc mình xóa trường thừa ở đây, là để mình nhét data vào update ở dưới mà không có cản trở về mặt ts
    // đồn thời sẽ tiết kiệm ram khá nhiều 
    delete data.avartar_url;
    if (updateUserDto.password) {
    data.pass = await this.hasCode.hashPassword(updateUserDto.password);
    }
    delete data.password;
    // Xóa trường images nếu có (trường này dùng để upload file)
    delete data.images;
    const res = await this.prisma.users.update({
      where: { id },
      data,
      select: this.userSafeSelect
    });
    return res;
  }
}
