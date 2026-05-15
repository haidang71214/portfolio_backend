import { IsOptional, IsString, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class UpsertSkillDto {

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsString()
  category?: string;
}
