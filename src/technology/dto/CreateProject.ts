import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ description: 'Tên dự án', example: 'Portfolio Website' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mô tả chi tiết', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Link demo', required: false })
  @IsString()
  @IsOptional()
  demo_url?: string;

  @ApiProperty({ description: 'Link Github', required: false })
  @IsString()
  @IsOptional()
  github_url_be?: string;

  @ApiProperty({ description: 'Link Github Fe ', required: false })
  @IsString()
  @IsOptional()
  github_url_fe?: string;
  
  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  order_index?: number;

  @ApiProperty({ description: 'Trạng thái hiển thị', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: 'File ảnh gửi lên từ Client', 
    required: false 
  })
  @IsOptional()
  image?: any;

  // thực ra cái này nên để là thumbnail
  @ApiHideProperty()
  @IsString()
  @IsOptional()
  images_url?: string;
}
