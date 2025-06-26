import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GithubUsersDto } from './github.dto';

@Controller('github')
export class GithubController {
  constructor(private configService: ConfigService) {}

  @Post()
  async getUsers(@Body() body: GithubUsersDto) {
    const GITHUB_TOKEN = this.configService.get<string>('GITHUB_TOKEN');
    if (!GITHUB_TOKEN) throw new BadRequestException('GitHub token not set');
    const { usernames } = body;
    const results = await Promise.all(
      usernames.map(async username => {
        try {
          const response = await axios.get(`https://api.github.com/users/${username}`,
            {
              headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'User-Agent': 'NestJS-App',
                Accept: 'application/vnd.github+json',
              },
            }
          );
          const { login, name, avatar_url, bio, followers } = response.data;
          return { login, name, avatar_url, bio, followers };
        } catch (err) {
          return { login: username, error: err.response?.data?.message || 'Error fetching user' };
        }
      })
    );
    return results;
  }
} 