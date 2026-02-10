import { IsString, IsBoolean, IsOptional, MinLength } from "class-validator";

export class CreateArticleDto {
  @IsString()
  @MinLength(1, { message: "Tiêu đề không được để trống" })
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
