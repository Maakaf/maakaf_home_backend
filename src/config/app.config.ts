import { IsNumber, IsString, IsOptional } from 'class-validator';

export class AppConfig {
  // GitHub Configuration
  @IsString()
  GITHUB_TOKEN: string;

  // MongoDB Configuration
  @IsOptional()
  @IsString()
  MONGODB_URI?: string = 'mongodb://localhost:27017/maakaf_home';

  // Application Configuration
  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  @IsOptional()
  @IsNumber()
  PORT?: number = 3000;

  // Business Logic Configuration
  @IsOptional()
  @IsNumber()
  MIN_FORK_COUNT?: number = 3;

  @IsOptional()
  @IsNumber()
  MONTHS_TO_ANALYZE?: number = 6;

  @IsOptional()
  @IsNumber()
  MAX_REPOS_PER_USER?: number = 100;

  @IsOptional()
  @IsNumber()
  MAX_COMMITS_PER_REPO?: number = 100;

  @IsOptional()
  @IsNumber()
  MAX_PRS_PER_REPO?: number = 100;

  @IsOptional()
  @IsNumber()
  MAX_ISSUES_PER_REPO?: number = 100;

  @IsOptional()
  @IsNumber()
  CACHE_TTL_HOURS?: number = 24;
}
