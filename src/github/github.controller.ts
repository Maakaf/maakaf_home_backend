import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { 
  GithubUsersDto, 
  GithubActivityResponseDto, 
  BadRequestResponseDto, 
  InternalServerErrorResponseDto, 
  UnauthorizedResponseDto 
} from './github.dto';
import { GithubActivityService } from './github-activity.service';

@ApiTags('GitHub')
@Controller('github')
export class GithubController {
  private readonly logger = new Logger(GithubController.name);

  constructor(
    private configService: ConfigService,
    private githubActivityService: GithubActivityService
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Get GitHub activity data for users',
    description: 'Fetches GitHub activity data including commits, pull requests, issues, and comments for the specified users in the last 6 months. Requires GitHub token to be configured. Only analyzes repositories with more than the minimum fork count (default: 3).'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved GitHub activity data for all requested users',
    type: GithubActivityResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid request body (e.g., empty usernames array, invalid format)',
    type: BadRequestResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'GitHub token not configured in environment variables',
    type: UnauthorizedResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error occurred while processing the request or GitHub API error',
    type: InternalServerErrorResponseDto
  })
  async getUsersData(@Body() body: GithubUsersDto): Promise<GithubActivityResponseDto> {
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