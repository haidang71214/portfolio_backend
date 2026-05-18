import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/CreateProject';
import { createAndUpdateImages } from './dto/create-technology.dto';
import { CloudUploadService } from '../shared/cloudinary.service';
import { CreateTechStackDto } from './dto/createTechStack';
import { UpdateTechStackDto } from './dto/UpdateTechStack';

@Injectable()
export class TechnologyService {
  constructor(private readonly prisma:PrismaService,
       private readonly cloudynaryService : CloudUploadService
  ){}
// quản lí project ở đây, project images, và tech-stack có phần hơi riêng. nhma cứ tách ra cũng được, nhớ handle việc xóa
// vì nó sẽ khá lá nặng khi bị phồng ra.
  async create(user_id:string,createTechnologyDto: CreateProjectDto) {
  if(!(await this.prisma.users.findFirst({where:{id:user_id}}))){
    throw new NotFoundException("This User have not permissionn")
  }
    const res = await this.prisma.projects.create({data:{
    title: createTechnologyDto.title,
    description: createTechnologyDto.description,
    thumbnail: createTechnologyDto.images_url,
    demo_url: createTechnologyDto.demo_url,
    github_url_fe: createTechnologyDto.github_url_fe,
    github_url_be: createTechnologyDto.github_url_be,
    order_index: createTechnologyDto.order_index,
    is_active : createTechnologyDto.is_active,
    user_id
    }});

    return res;
  }
// all project belong to user.
  async findAll(id:string) {
     await this.prisma.users.findFirstOrThrow({where:{id}});
    const res = await this.prisma.projects.findMany({where:{user_id:id}, orderBy: { order_index: 'asc' }, // Sắp xếp theo order_index từ nhỏ đến lớn
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        demo_url: true,
        github_url_be: true,
        github_url_fe:true,
        order_index: true,
        is_active: true,
        created_at: true
      }
    });
    return res;
  }
// thực ra cái get ở trên nó đã lấy hết thuộc tính rồi, hmm. nếu get riêng cái này thì sẽ hơi hơi có vấn đề 1 chút.
// nhma hình như phần này chưa nối bảng.
  async findOne(id: string) {
    return await this.prisma.projects.findFirstOrThrow({
      where: { id },
      include: {
        project_images: true,
        project_tech_stack: {include:{
          tech_stack:true
        }}, // Nếu bảng tech stack có link tới bảng tech gốc, bạn có thể lồng thêm include { technology: true } vào đây nhé.
      }
    }); 
  }
// làm thêm 1 cái để active hoặc không, active mới cho lòi ra.
  async checkActive(userId:string | undefined,id:string){
    if(userId){
      await this.prisma.projects.findFirstOrThrow({where:{
        user_id:userId,
        id
      }})
    }else{
     await this.prisma.projects.findFirstOrThrow({where:{
        id
      }})
    }
      const res = await this.prisma.projects.findFirstOrThrow({where:{id}});
      if(res.is_active){
      return await this.prisma.projects.update({where:{
      id
    },data:{
      is_active:false
    }})
    }else{
      return await this.prisma.projects.update({where:{id},data:{
        is_active:true
      }})
    }
  }
// hmm mấy cái này liên quan đến ảnh và project rồi, có cần confirm là project đó thuộc user không ta.
// hoặc nó thể mình block ngay đoạn đầu thì nó không vào đượ đây.
  async CreateProjectImages(user_id: string | undefined, project_id: string, updateTechnologyDto: createAndUpdateImages) {
    if (!updateTechnologyDto.images_url) {
      throw new BadRequestException("You Should Update Image For This Fields.");
    }  
    if (user_id) {
      await this.prisma.projects.findFirstOrThrow({
        where: { id: project_id, user_id }
      });
    } else {
      await this.prisma.projects.findFirstOrThrow({
        where: { id: project_id }
      });
    }
    const res = await this.prisma.project_images.create({
      data: {
        project_id,
        image_url: updateTechnologyDto.images_url,
        display_order: updateTechnologyDto.display_order || 0,
      }
    });

    return res;
  }

  // user với cái admin, cần trỏ đúng folder chứa ảnh.
  async remove(user_id:string | undefined ,id: string) {
    const resImages = await this.prisma.project_images.findFirstOrThrow({where:{id}});
    if(user_id){
      await this.prisma.projects.findFirstOrThrow({where:{id,user_id}})
    }
    await this.cloudynaryService.deleteImage(resImages.image_url);
    const res = await this.prisma.project_images.delete({where:{id}})
    return res;
  }
  // tiếp đến những cái techStack, cái này sẽ do admin Xử lí tạo techstack mới
  // xong filter cho nó không hiện ra nếu bị ẩn.
  async createTechStack(techstackDto :CreateTechStackDto){
    const res = await this.prisma.tech_stack.create({data:{name:techstackDto.name,
      icon_url:techstackDto.icon_url,
      is_active:techstackDto.is_active || true,
    }})
    return res;
  }

  async updateTechStack(techStackId:string, data:UpdateTechStackDto){
    const checkStack = await this.prisma.tech_stack.findFirstOrThrow({where:{id:techStackId}});
    
    // Nếu có gửi lên icon_url mới và nó khác với icon_url hiện tại
    if (data.icon_url && data.icon_url !== checkStack.icon_url) {
      // Xoá ảnh cũ trên Cloudinary (nếu có)
      if (checkStack.icon_url) {
        await this.cloudynaryService.deleteImage(checkStack.icon_url);
      }
    }

    const {...result} = data;
    delete result.image; // Xoá trường image (file) khỏi data đưa vào Prisma vì database không có cột này
    
    const res = await this.prisma.tech_stack.update({where:{id:techStackId},data: result})
    return res;
  }
  //check user_id ở đây, làm cho cả admin nữa.
  async addTechStack(user_id: string | undefined, id:string, project_id:string){
    if (user_id) {
      await this.prisma.projects.findFirstOrThrow({ where: { id: project_id, user_id } });
    } else {
      await this.prisma.projects.findFirstOrThrow({ where: { id: project_id } });
    }
    const res = await this.prisma.project_tech_stack.create({
      data: {
        project_id,
        tech_id: id
      }
    });
    return res;
  }

  async removeTechStackFromProject(user_id: string | undefined, id:string, project_id:string){
    if (user_id) {
      await this.prisma.projects.findFirstOrThrow({ where: { id: project_id, user_id } });
    } else {
      await this.prisma.projects.findFirstOrThrow({ where: { id: project_id } });
    }
    const res = await this.prisma.project_tech_stack.delete({
      where: {
        project_id_tech_id: {
          project_id,
          tech_id: id
        }
      }
    });
    return res;
  }
// để public.
  async getAllStack(){
    const res = await this.prisma.tech_stack.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return res;
  }

  
  // create các thứ thì bình thường, 

}
