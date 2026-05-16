import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class UpsertSkillDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  level?: number;
  @ApiProperty()
  @IsOptional()
  @IsString()
  category?: string;
}
