import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GithubUsersDto } from './github.dto';
import { GithubActivityService } from './github-activity.service';

@Controller('github')
export class GithubController {
  private readonly logger = new Logger(GithubController.name);

  constructor(
    private configService: ConfigService,
    private githubActivityService: GithubActivityService
  ) {}

  @Post()
  async getUsersData(@Body() body: GithubUsersDto) {
    this.logger.log(`Received request for usernames: ${JSON.stringify(body.usernames)}`);
    const GITHUB_TOKEN = this.configService.get<string>('GITHUB_TOKEN');
    this.logger.log(`GitHub token configured: ${GITHUB_TOKEN ? 'Yes' : 'No'}`);
    if (!GITHUB_TOKEN) throw new BadRequestException('GitHub token not set');
    const { usernames } = body;
    const results = await this.githubActivityService.getUserActivity(usernames);
    this.logger.log(`Returning results for ${results.users.length} users`);
    return results;
  }
} 