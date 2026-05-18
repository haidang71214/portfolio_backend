import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSkillDto } from './dto/upsert-skill.dto';
import { UpsertCertificateDto } from './dto/upsert-certificate.dto';
import { UpsertExperienceDto } from './dto/experience';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user_portfolios.findMany();
  }

  async findOne(id: string) {
    const result = await this.prisma.user_portfolios.findUniqueOrThrow({ where: { id } });
    return result;
  }
  
  async getMyPortfolio(userId: string) {
    // Trả về null nếu chưa có, Front-end tự xử lý hiển thị giao diện "Tạo mới"
    return await this.prisma.user_portfolios.findUnique({
      where: { user_id: userId },
      include: { theme: true } // Kèm theo thông tin theme nếu cần
    });
  }



  // --- PORTFOLIO MANAGEMENT --- //

  // Dùng chung cho cả User tự update và Admin update dùm User
  async upsertPortfolio(userId: string | undefined, updateDto: UpdatePortfolioDto) {
    if (!userId) {
      throw new BadRequestException("User ID is required to update or create a portfolio");
    }

    // Nếu có truyền theme_id, kiểm tra xem theme đó có hợp lệ không
    if (updateDto.theme_id) {
      const templateCheck = await this.prisma.theme_templates.findUnique({ where: { id: updateDto.theme_id } });
      if (!templateCheck || !templateCheck.is_active) {
        throw new NotFoundException("Template không tồn tại hoặc chưa được kích hoạt");
      }
    }
    const defaultThemeId = updateDto.theme_id || "default-theme-id"; 

    const existingPortfolio = await this.prisma.user_portfolios.findUnique({
      where: { user_id: userId }
    });

    let result;
    if (existingPortfolio) {
      result = await this.prisma.user_portfolios.update({
        where: { user_id: userId },
        data: {
          theme_id: updateDto.theme_id,
          title: updateDto.title,
          bio: updateDto.bio,
          ...(updateDto.custom_config !== undefined && { custom_config: updateDto.custom_config })
        }
      });
    } else {
      result = await this.prisma.user_portfolios.create({
        data: {
          user_id: userId,
          theme_id: defaultThemeId, 
          title: updateDto.title,
          bio: updateDto.bio,
          ...(updateDto.custom_config !== undefined && { custom_config: updateDto.custom_config })
        }
      });
    }

    return result;
  }

  async adminUpsertPortfolio(targetUserId: string, updateDto: UpdatePortfolioDto) {
    return this.upsertPortfolio(targetUserId, updateDto);
  }

  // Giữ lại hàm cũ của bạn nếu vẫn muốn dùng riêng
  async changeTheme(userId: string | undefined, newThemeId: string) {
    if (!userId) {
      throw new BadRequestException("User ID is required to change theme");
    }

    const templateCheck = await this.prisma.theme_templates.findUnique({ where: { id: newThemeId } });
    if (!templateCheck || !templateCheck.is_active) {
      throw new NotFoundException("Not found template or template active yet");
    }
    const existingPortfolio = await this.prisma.user_portfolios.findUnique({
      where: { user_id: userId }
    });

    let result;
    if (existingPortfolio) {
      result = await this.prisma.user_portfolios.update({
        where: { user_id: userId },
        data: { theme_id: newThemeId }
      });
    } else {
      result = await this.prisma.user_portfolios.create({
        data: { user_id: userId, theme_id: newThemeId }
      });
    }
    return result;
  }
  
  async adminChangeThemeForUser(userId: string, newThemeId: string) {
    return this.changeTheme(userId, newThemeId);
  }
  // quản lí những thứ gọi là chung của chính user đó.
// được phân quyền trực tiếp ở controller.
  async getSkillUser(user_id:string){
    const result = await this.prisma.skills.findMany({where:{user_id}});
    return result;
  }
  async getDetailSkill(id:string){
    const result = await this.prisma.skills.findFirstOrThrow({where:{id}});
    return result;
  }
  // delete skill của user
  async deleteSkill(id:string){
    const result = await this.prisma.skills.delete({where:{id}})
    return result
  }
// update detail của cái skill đó.
  async upsertSkillUser(user_id: string | undefined, dto: UpsertSkillDto, id: string) {
    if (id) {
      if (user_id) {
        const existingSkill = await this.prisma.skills.findFirst({
          where: { id, user_id }
        });
        if (!existingSkill) {
          throw new NotFoundException('Skill not found or does not belong to user');
        }
      } else {
        await this.prisma.skills.findFirstOrThrow({ where: { id } });
      }

      return await this.prisma.skills.update({
        where: { id },
        data: {
          name: dto.name,
          level: dto.level,
          category: dto.category
        }
      });
    }

    if (!user_id) {
      throw new BadRequestException('user_id is required to create a skill');
    }

    return await this.prisma.skills.create({
      data: {
        user_id,
        name: dto.name,
        level: dto.level,
        category: dto.category
      }
    });
  }
// -- certificate:
  async getCertificateUser(user_id: string) {
    const result = await this.prisma.certificates.findMany({ 
      where: { user_id } 
    });
    return result;
  }

  async getDetailCertificate(id: string) {
    const result = await this.prisma.certificates.findFirstOrThrow({ 
      where: { id } 
    });
    return result;
  }
// trừ get là public ra thì mọi cái ở sau đó đều do admin hoặc là chính người dùng tạ
  async deleteCertificate(id: string,user_id?:string) {
    if(user_id){
          const checkSert = await this.prisma.certificates.findFirstOrThrow({where:{user_id}})
          if(!checkSert){
            throw new NotFoundException("you're not have permission with this certificate"); 
          }
           return await this.prisma.certificates.delete({ 
      where: { id } 
    });
    }
    return await this.prisma.certificates.delete({ 
      where: { id } 
    });
  }
// vấn đề là đây có 2 cái id nữa.
// có id khi update, không có khi create
  async upsertCertificateUser(user_id: string | undefined, dto: UpsertCertificateDto) { // Bỏ cái id?:string ở cuối đi vì đã có dto.id
    
    // TRƯỜNG HỢP 1: CÓ ID -> UPDATE
    if (dto.id) {
      if (user_id) {
        // 1. Kiểm tra xem chứng chỉ có tồn tại và thuộc về user này không
        const existingCert = await this.prisma.certificates.findFirst({
          where: { id: dto.id, user_id }
        });
        
        if (!existingCert) {
          throw new NotFoundException('Certificate not found or does not belong to user');
        }
      } else {
        await this.prisma.certificates.findFirstOrThrow({ where: { id: dto.id } });
      }

      // 2. Dùng lệnh update thẳng luôn
      return await this.prisma.certificates.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          organization: dto.organization,
          issue_date: dto.issue_date,
          expiration_date: dto.expiration_date,
          credential_id: dto.credential_id,
          credential_url: dto.credential_url,
          image_url: dto.image_url,
        }
      });
    }

    // TRƯỜNG HỢP 2: KHÔNG CÓ ID -> CREATE
    if (!user_id) {
      throw new BadRequestException('user_id is required to create a certificate');
    }

    return await this.prisma.certificates.create({
      data: {
        user_id, // Nhớ gán user_id vào nhé
        name: dto.name,
        organization: dto.organization,
        issue_date: dto.issue_date,
        expiration_date: dto.expiration_date,
        credential_id: dto.credential_id,
        credential_url: dto.credential_url,
        image_url: dto.image_url,
      }
    });
  }

// tiếp tục cái kinh nghiệm là xong những cái chung:
 async getExperienceUser(user_id: string) {
    const result = await this.prisma.experiences.findMany({ 
      where: { user_id },
      orderBy: { start_date: 'desc' }   // sắp xếp mới nhất trước
    });
    return result;
  }

  async getDetailExperience(id: string) {
    const result = await this.prisma.experiences.findFirstOrThrow({ 
      where: { id } 
    });
    return result;
  }

  // delete experience của user
  async deleteExperience(id: string,user_id?:string) {
    if(user_id){
      if(await this.prisma.experiences.findFirst({where:{user_id}})){
         return await this.prisma.experiences.delete({ 
      where: { id } 
    });
      }else{
        throw new ForbiddenException("Youre not have permission");
      }
    }
    return await this.prisma.experiences.delete({ 
      where: { id } 
    });
  }

  async upsertExperienceUser(user_id: string | undefined, dto: UpsertExperienceDto) {
    if (dto.id) {
      if (user_id) {
        // 1. Kiểm tra quyền sở hữu
        const existingExp = await this.prisma.experiences.findFirst({
          where: { id: dto.id, user_id }
        });
        
        if (!existingExp) {
          throw new NotFoundException('Experience not found or does not belong to user');
        }
      } else {
        await this.prisma.experiences.findFirstOrThrow({ where: { id: dto.id } });
      }

      // 2. Dùng lệnh update
      return await this.prisma.experiences.update({
        where: { id: dto.id },
        data: {
          company_name: dto.company_name,
          position: dto.position,
          start_date: new Date(dto.start_date),
          end_date: dto.end_date ? new Date(dto.end_date) : null,
          description: dto.description,
        },
      });
    }

    if (!user_id) {
      throw new BadRequestException('user_id is required to create an experience');
    }

    return await this.prisma.experiences.create({
      data: {
        user_id, // Nhớ luôn có user_id khi create
        company_name: dto.company_name,
        position: dto.position,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        description: dto.description,
      },
    });
  }

}
