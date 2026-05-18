import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { TechnologyService } from './technology.service';

import { CreateProjectDto } from './dto/CreateProject';
import { JwtAuthGuard } from '../auth/stratergy/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudUploadService } from '../shared/cloudinary.service';
import { RolesGuard } from '../auth/stratergy/role.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { createAndUpdateImages } from './dto/create-technology.dto';
import { CreateTechStackDto } from './dto/createTechStack';

@Controller('technology')
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService,
    private readonly cloudynaryService : CloudUploadService
  ) {}

// user, admin.
  @Post('project')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image'))
  async createProjectUser(@Body() createTechnologyDto: CreateProjectDto,
  @Req() req,
  @UploadedFile() file:  Express.Multer.File
) {
    const {userId} = req.user;
     if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"image");
      createTechnologyDto.images_url =  (await res_images).secure_url;
    }
    return this.technologyService.create(userId,createTechnologyDto);
  }

  @Post('manage/project/:userId')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image'))
  async createProjectAdmin(@Body() createTechnologyDto: CreateProjectDto,
  @Param('userId') userId:string,
  @UploadedFile() file:  Express.Multer.File
) {
     if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"image");
      createTechnologyDto.images_url =  (await res_images).secure_url;
    }
    return this.technologyService.create(userId,createTechnologyDto);
  }

  @Get('project/:userId')
  @HttpCode(200)
  findAll(
    @Param('userId') id:string
  ){
    return this.technologyService.findAll(id);
  }

  @Get('project/:id')
  async findOne(@Param('id') id: string) {
    return await this.technologyService.findOne(id);
  }
// for user.
  @Post('project/images/:projectId')
  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('projectId') id: string,
  @Body() updateTechnologyDto: createAndUpdateImages,
  @Req() req,
    @UploadedFile() file:  Express.Multer.File
  
) 
  {
      if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"image");
      updateTechnologyDto.images_url =  (await res_images).secure_url;
    }
    const {userId} = req.user;
    return this.technologyService.CreateProjectImages(userId,id, updateTechnologyDto);
  }
//
 @Post('project/images/:projectId')
  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async adminUpdate(
  @Param('projectId') id: string,
  @Body() updateTechnologyDto: createAndUpdateImages,
  @UploadedFile() file:  Express.Multer.File
  
) 
  {
      if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"image");
      updateTechnologyDto.images_url =  (await res_images).secure_url;
    }
   
    return this.technologyService.CreateProjectImages(undefined,id, updateTechnologyDto);
  }



  @Delete('project/images/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async removeImages(@Param('id') id: string,
  @Req() req
) {
    const{userId} = req.user;
    return await this.technologyService.remove(userId,id);
  }
  @Delete('manage/project/images/:id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(200)
  removeImagesAdmin(@Param('id') id: string,
) {
    return this.technologyService.remove(undefined,id);
  }

// hết images sẽ đến techStack
@Post('manage/techStack')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@HttpCode(200)
@UseInterceptors(FileInterceptor('image'))
async createTechStack(createTechStack:CreateTechStackDto,
  @UploadedFile() file:  Express.Multer.File
){
   if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"image");
      createTechStack.icon_url =  (await res_images).secure_url;
    }
    const result = await this.technologyService.createTechStack(createTechStack);
    return result;
}
@Patch('manage/techStack/:id')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@HttpCode(200)
@UseInterceptors(FileInterceptor('image'))
async updateTechStack(createTechStack:CreateTechStackDto,
  @UploadedFile() file:  Express.Multer.File,
  @Param('id') id:string
){
   if(file){
      const res_images = await this.cloudynaryService.uploadImage(file,"image");
      createTechStack.icon_url =  res_images.secure_url;
      
    }
    const result = await this.technologyService.updateTechStack(id,createTechStack);
    return result;
}
// làm xong phần của tech, check lại phần project, hình như có logic bị lặp ở chỗ đó.
// 1 là các logic check sự tồn tại đang bị lấy 1 trường, đây là lỗ hổng trong code.
// 2 là các logic bị lặp.
// 3 là các trường dư thừa ở dto khi ép bị dư, làm tốn ram.
// check ở những common nữa.
// cần check lại các logic nhận hoặc không nhận với admin và user.
// vì mình tận dụng funcion nên cần check.
// mình cần clean lại tí.
}
