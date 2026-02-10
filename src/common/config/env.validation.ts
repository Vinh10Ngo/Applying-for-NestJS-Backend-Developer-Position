import { plainToInstance } from "class-transformer";
import {
  IsNumber,
  IsString,
  IsOptional,
  validateSync,
  Min,
} from "class-validator";

class EnvVariables {
  @IsOptional()
  @IsNumber()
  @Min(1)
  PORT?: number = 3000;

  @IsString()
  MONGODB_URI!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES?: string = "7d";

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES?: string = "7d";
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { whitelist: true });
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(", "))
      .join("; ");
    throw new Error(`Biến môi trường không hợp lệ: ${messages}`);
  }

  return validated;
}
