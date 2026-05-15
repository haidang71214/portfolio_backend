import { Controller, Get, Body, Patch, Param, UseGuards, Req, Query, BadRequestException, Delete, HttpCode } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { ChangeThemeDto } from './dto/change-theme.dto';
import { UpsertSkillDto } from './dto/upsert-skill.dto';

import { JwtAuthGuard } from '../auth/stratergy/jwt.guard';
import { RolesGuard } from '../auth/stratergy/role.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
// ở đây có 1 số cái sai chí mạng, đây là môi trường public nên không cần đến authen để get.

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}


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
  // certificate tối làm
}
