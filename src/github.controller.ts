import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GithubUsersDto } from './github.dto';
import { GithubActivityService } from './github-activity.service';

@Controller('github')
export class GithubController {
  constructor(
    private configService: ConfigService,
    private githubActivityService: GithubActivityService
  ) {}

  @Post()
  async getUsers(@Body() body: GithubUsersDto) {
    const GITHUB_TOKEN = this.configService.get<string>('GITHUB_TOKEN');
    if (!GITHUB_TOKEN) throw new BadRequestException('GitHub token not set');
    const { usernames } = body;
    const results = await this.githubActivityService.getUserActivity(usernames);
    return results;
  }
} 