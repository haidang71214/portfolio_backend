import { Controller, Get, Body, Patch, Param, UseGuards, Req, Query, BadRequestException, Delete, HttpCode, Put, UseInterceptors, UploadedFile, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { ChangeThemeDto } from './dto/change-theme.dto';
import { UpsertSkillDto } from './dto/upsert-skill.dto';

import { JwtAuthGuard } from '../auth/stratergy/jwt.guard';
import { RolesGuard } from '../auth/stratergy/role.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UpsertCertificateDto } from './dto/upsert-certificate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudUploadService } from '../shared/cloudinary.service';
import { UpsertExperienceDto } from './dto/experience';
// ở đây có 1 số cái sai chí mạng, đây là môi trường public nên không cần đến authen để get.

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService,
private readonly cloudinaryService : CloudUploadService
  ) {}


  @Get()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(200)
  findAll() {
    return this.profileService.findAll();
  }
  @Patch('me/portfolio')
  @UseGuards(JwtAuthGuard)
   @ApiBearerAuth()
   @HttpCode(200)
  updateMyPortfolio(@Req() req, @Body() updateDto: UpdatePortfolioDto) {
    const { userId } = req.user;
    return this.profileService.upsertPortfolio(userId, updateDto);
  }

  @Patch('admin/portfolio/:userId')
  @UseGuards(JwtAuthGuard,RolesGuard) 
  @Roles('admin')
   @ApiBearerAuth()
   @HttpCode(200)
  adminUpdateUserPortfolio(
    @Param('userId') targetUserId: string, 
    @Body() updateDto: UpdatePortfolioDto
  ) {
    return this.profileService.adminUpsertPortfolio(targetUserId, updateDto);
  }

  @Patch('me/theme')
  @UseGuards(JwtAuthGuard)
   @HttpCode(200)
    @ApiBearerAuth()
  changeMyTheme(@Req() req, @Body() changeThemeDto: ChangeThemeDto) {
    const { userId } = req.user;
    return this.profileService.changeTheme(userId, changeThemeDto.theme_id);
  }

  @Patch('admin/theme/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @ApiBearerAuth()
  adminChangeTheme(
    @Param('userId') targetUserId: string,
    @Body() changeThemeDto: ChangeThemeDto
  ) {
    return this.profileService.adminChangeThemeForUser(targetUserId, changeThemeDto.theme_id);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }
// quản lí những thứ liên quan chung như skills, certtificate,experiences
  @Patch('me/skills/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  upsertMySkill(@Req() req,
  @Body() upsertSkillDto: UpsertSkillDto,
  @Param('id') id:string
) {
    const { userId } = req.user;
    return this.profileService.upsertSkillUser(userId, upsertSkillDto,id);
  }
  @Patch('manage/skills')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
   @ApiBearerAuth()
   @HttpCode(200)
  async manageUpdateSkill(
    @Query('id') id: string,
    @Query('userId') userId: string,
    @Body() body: UpsertSkillDto,
  ) {
    if (!id) throw new BadRequestException('Skill ID is required');
    if (!userId) throw new BadRequestException('User ID is required');
    return await this.profileService.upsertSkillUser(userId,body,id);
  }

  @Get("skill/:userId")
  @HttpCode(200)
  async GetManageUser(
    @Param('userId') id :string
  ){
    const result = await this.profileService.getSkillUser(id);
    return result;
  };
  @Delete('skill/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async deleteSkill(
    @Param('id') id:string
  ){
    const result = await this.profileService.deleteSkill(id);
    return result
  }
  @Get('certificate/:userId')
  @HttpCode(200)
  async getUserCert(
    @Param('userId') id:string
  ){
    return await this.profileService.getCertificateUser(id);
  }
  // detail cert
  @Get('certificate/:id')
  @HttpCode(200)
  async getDetailCertificate(
    @Param('id') id:string
  ){
    return this.profileService.getDetailCertificate(id);
  }
// mình nghĩ là mình sẽ check lại kĩ hơn 1 tí về func ở những chức năng khác.
  @Delete('manage/certificate/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async deleteCert(
    @Param('id') id:string
  ){
    return await this.profileService.deleteCertificate(id)
  }
// làm 2 cái
  @Delete('certificacte/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async userDeleteCert(
    @Param('id') id:string,
    @Req () req
  ){
  const {userId} = req.user
  return await this.profileService.deleteCertificate(id,userId)
  }
// user dung
// tách ra 2 cái, nhma vấn đề là làm vậy có hơi kì ở api.
// phần id mình nhét vào dto luôn, làm thế sẽ tránh được lỗi upsert
@Post('certificate') 
@UseGuards(JwtAuthGuard)
@ApiConsumes('multipart/form-data')
 @UseInterceptors(FileInterceptor('image'))
 @HttpCode(200)
 @ApiBearerAuth()
 async createShitCertificate(
  @Req() req,
  @Body() dto:UpsertCertificateDto,
   @UploadedFile() file:  Express.Multer.File
 ){
// cần xử lí file, với upsert hơi khác tí.
  const {userId} = req.user;
     if(file){
      const res_images = await this.cloudinaryService.uploadImage(file,"image");
      dto.image =  (await res_images).secure_url;
    }
  const result = await this.profileService.upsertCertificateUser(userId,dto);
  return result;
 }
// patch
 @Patch('certificate')
 @UseGuards(JwtAuthGuard)
 @UseInterceptors(FileInterceptor('image'))
 @HttpCode(200)
 @ApiConsumes('multipart/form-data')
 @ApiBearerAuth()
 async certificateUser(
  @Req() req,
  @Body() dto:UpsertCertificateDto,
   @UploadedFile() file:  Express.Multer.File
 ){
// cần xử lí file, với upsert hơi khác tí.
  const {userId} = req.user;
     if(file){
      const res_images = await this.cloudinaryService.uploadImage(file,"image");
      dto.image =  (await res_images).secure_url;
    }
  const result = await this.profileService.upsertCertificateUser(userId,dto);
  return result;
 }
// admin
@Post('manage/certificate/:userId')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@HttpCode(200)
@ApiConsumes('multipart/form-data')
@ApiBearerAuth()
 @UseInterceptors(FileInterceptor('image'))
 async certificateShitUserAdmin(
  @Param('userId') id:string,
  @Body() dto:UpsertCertificateDto,
   @UploadedFile() file:  Express.Multer.File
 ){
     if(file){
      const res_images = await this.cloudinaryService.uploadImage(file,"image");
      dto.image =  (await res_images).secure_url;
    }
  const result = await this.profileService.upsertCertificateUser(id,dto);
  return result;
 }

 @Patch('manage/certificate/:userId')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@HttpCode(200)
@ApiConsumes('multipart/form-data')
@ApiBearerAuth()
 @UseInterceptors(FileInterceptor('image'))
 async certificateUserAdmin(
  @Param('userId') id:string,
  @Body() dto:UpsertCertificateDto,
   @UploadedFile() file:  Express.Multer.File
 ){
     if(file){
      const res_images = await this.cloudinaryService.uploadImage(file,"image");
      dto.image =  (await res_images).secure_url;
    }
  const result = await this.profileService.upsertCertificateUser(id,dto);
  return result;
 }
// experience
 
 @Get('experience/:userId')
 @HttpCode(200)
 async getUserExperience(
  @Param('userId') id:string
 ){
  return await this.profileService.getExperienceUser(id);
 }
 @Get('/experience/:id')
 @HttpCode(200)
 async detailExp(
  @Param('id') id:string
 ){
  return await this.profileService.getDetailExperience(id);
 }
// phân quyền rõ với những cái còn lại.
// user 
@Delete("experience/:id")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async deleteFuckingExp(
  @Param('id') id:string,
  @Req() req,
){
  const {userId} = req.user;
  return await this.profileService.deleteExperience(id,userId);
}
@Delete('manager/experience/:id')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@ApiBearerAuth()
async heheDeleteExp(
  @Param('id') id:string
){
  return await this.profileService.deleteExperience(id);
}
// patch với create.
// user
@Post('experience')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async createExperienct(
  @Body() body:UpsertExperienceDto,
  @Req() req
){
 const {userId} = req.user;
 return await this.profileService.upsertExperienceUser(userId,body);
}
//admin
@Post('manage/experience/:userId')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
@ApiBearerAuth()
async createExperienctadmin(
  @Body() body:UpsertExperienceDto,
  @Param('userId') userId:string
){
 return await this.profileService.upsertExperienceUser(userId,body);
}
// patch 
@Patch('experience')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async updateExp(
  @Req() req:any,
  @Body() body:UpsertExperienceDto
){
  const {userId} = req.user;
 return await this.profileService.upsertExperienceUser(userId,body);
}
@Patch('experience/:userId')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@ApiBearerAuth()
async updateExpa(
  @Param('userId') id:string,
  @Body() body:UpsertExperienceDto
){
 return await this.profileService.upsertExperienceUser(id,body);
}

// done.
}
