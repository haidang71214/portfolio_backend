import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ description: 'Tiêu đề trang portfolio (ví dụ: Hải Đăng - Senior Backend Developer)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Đoạn giới thiệu ngắn gọn (Bio)' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'ID của theme giao diện' })
  @IsString()
  @IsOptional()
  theme_id?: string;

  @ApiPropertyOptional({ 
    description: `Cấu hình giao diện tùy biến (custom_config).
    Ví dụ cho ngành IT:
    { "themeColor": "#00FF00", "showGithubStats": true, "layout": "code-grid" }
    
    Ví dụ cho Nhà báo (Journalist):
    { "themeColor": "#333333", "fontFamily": "Merriweather", "layout": "magazine-style" }
    
    Ví dụ cho ngành Kinh tế (Economic):
    { "themeColor": "#003366", "showMetricsChart": true, "layout": "corporate" }
    ` 
  })
  @IsObject()
  @IsOptional()
  custom_config?: Record<string, any>;
}
