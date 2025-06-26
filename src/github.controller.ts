import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('github')
export class GithubController {
  constructor(private configService: ConfigService) {}

  @Get(':username')
  async getUser(@Param('username') username: string) {
    const GITHUB_TOKEN = this.configService.get<string>('GITHUB_TOKEN');
    const response = await axios.get(`https://api.github.com/users/${username}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'NestJS-App',
          Accept: 'application/vnd.github+json',
        },
      }
    )
    // Return only a few fields for demonstration
    const { login, name, avatar_url, bio, followers } = response.data;
    return { login, name, avatar_url, bio, followers };
  }
} 