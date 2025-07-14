import { plainToInstance } from 'class-transformer';
import { IsString, IsOptional, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  GITHUB_TOKEN: string;

  @IsOptional()
  @IsString()
  MONGODB_URI?: string = 'mongodb://localhost:27017/maakaf_home';

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
