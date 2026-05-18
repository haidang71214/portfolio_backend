import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTechStackDto {
   
  @ApiProperty({ description: 'Tên công nghệ', example: 'NestJS' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Trạng thái hiển thị', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: 'File ảnh icon gửi lên từ Client', 
    required: false 
  })
  @IsOptional()
  image?: any;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  icon_url?: string;
}
