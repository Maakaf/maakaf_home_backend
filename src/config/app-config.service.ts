import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  // GitHub Configuration
  get githubToken(): string {
    return this.configService.get<string>('GITHUB_TOKEN');
  }

  // Database Configuration
  get mongodbUri(): string {
    return this.configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/maakaf_home';
  }

  // Application Configuration
  get port(): number {
    return this.configService.get<number>('PORT') || 3000;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  // Business Logic Configuration
  get minForkCount(): number {
    return this.configService.get<number>('MIN_FORK_COUNT') || 3;
  }

  get monthsToAnalyze(): number {
    return this.configService.get<number>('MONTHS_TO_ANALYZE') || 6;
  }

  get maxReposPerUser(): number {
    return this.configService.get<number>('MAX_REPOS_PER_USER') || 100;
  }

  get maxCommitsPerRepo(): number {
    return this.configService.get<number>('MAX_COMMITS_PER_REPO') || 100;
  }

  get maxPRsPerRepo(): number {
    return this.configService.get<number>('MAX_PRS_PER_REPO') || 100;
  }

  get maxIssuesPerRepo(): number {
    return this.configService.get<number>('MAX_ISSUES_PER_REPO') || 100;
  }

  get cacheTTLHours(): number {
    return this.configService.get<number>('CACHE_TTL_HOURS') || 24;
  }

  // Calculated values
  get analysisStartDate(): Date {
    const days = this.monthsToAnalyze * 30.44; // Average days per month
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  get cacheExpiryDate(): Date {
    return new Date(Date.now() - this.cacheTTLHours * 60 * 60 * 1000);
  }
}
