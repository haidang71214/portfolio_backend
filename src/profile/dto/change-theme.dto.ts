import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeThemeDto {
  @ApiProperty({ description: 'ID của theme giao diện mới muốn đổi' })
  @IsString()
  @IsNotEmpty()
  theme_id: string;
}
