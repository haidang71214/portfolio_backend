import { IsOptional, IsString, IsUUID, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class UpsertCertificateDto {
  @ApiProperty({
    description: 'ID của chứng chỉ (chỉ dùng khi update)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    description: 'Tên chứng chỉ / khóa học',
    example: 'AWS Certified Solutions Architect',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tổ chức cấp chứng chỉ',
    example: 'Amazon Web Services',
    required: false,
  })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({
    description: 'Ngày cấp chứng chỉ',
    example: '2024-03-15',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @ApiProperty({
    description: 'Ngày hết hạn (nếu có)',
    example: '2027-03-15',
    required: false,
    type: String,
    format: 'date',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expiration_date?: string;

  @ApiProperty({
    description: 'Mã chứng chỉ / Credential ID',
    example: 'ABC123XYZ',
    required: false,
  })
  @IsOptional()
  @IsString()
  credential_id?: string;

  @ApiProperty({
    description: 'Link chứng chỉ (nếu có)',
    example: 'https://credly.com/badges/abc123',
    required: false,
  })
  @IsOptional()
  @IsString()
  credential_url?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  image_url?: string;

  // ====================== THÊM FIELD HỨNG FILE ======================
  @ApiProperty({
    description: 'File ảnh chứng chỉ (upload file)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  image?: any;   // Dùng để hứng file upload từ multipart/form-data
}