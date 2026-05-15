import { IsOptional, IsString, IsUUID, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertExperienceDto {
  @ApiProperty({
    description: 'ID của kinh nghiệm (chỉ dùng khi update)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    description: 'Tên công ty',
    example: 'FPT Software',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiProperty({
    description: 'Vị trí công việc',
    example: 'Senior Backend Developer',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({
    description: 'Ngày bắt đầu làm việc',
    example: '2023-01-15',
    required: true,
    type: String,
    format: 'date',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'Ngày kết thúc (có thể để null nếu đang làm)',
    example: '2025-05-15',
    required: false,
    type: String,
    format: 'date',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Mô tả công việc / thành tựu',
    example: 'Phụ trách phát triển các microservices cho hệ thống ngân hàng...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}