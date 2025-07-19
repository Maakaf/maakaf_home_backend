import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ArrayNotEmpty } from 'class-validator';

export class GithubUsersDto {
  @ApiProperty({ 
    example: ['UrielOfir', 'johndoe', 'janedoe'], 
    description: 'Array of GitHub usernames to analyze',
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  usernames: string[];
}

export class UserProfileDto {
  @ApiProperty({ example: 'UrielOfir', description: 'GitHub username' })
  username: string;

  @ApiProperty({ example: 'Uriel Ofir', required: false, description: 'User display name' })
  displayName?: string;

  @ApiProperty({ 
    example: 'https://avatars.githubusercontent.com/u/123456', 
    required: false, 
    description: 'User avatar URL' 
  })
  avatarUrl?: string;

  @ApiProperty({ example: 'Software Developer', required: false, description: 'User bio' })
  bio?: string;

  @ApiProperty({ example: 'Tel Aviv, Israel', required: false, description: 'User location' })
  location?: string;

  @ApiProperty({ example: 'Tech Corp', required: false, description: 'User company' })
  company?: string;

  @ApiProperty({ example: 'https://blog.example.com', required: false, description: 'User blog URL' })
  blog?: string;

  @ApiProperty({ example: 'urielofir', required: false, description: 'Twitter username' })
  twitterUsername?: string;

  @ApiProperty({ example: 42, description: 'Number of public repositories' })
  publicRepos: number;

  @ApiProperty({ example: 100, description: 'Number of followers' })
  followers: number;

  @ApiProperty({ example: 50, description: 'Number of following' })
  following: number;

  @ApiProperty({ example: 'User', description: 'GitHub account type (User or Organization)' })
  accountType: string;

  @ApiProperty({ example: '2020-01-01T00:00:00.000Z', description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ 
    example: 'User not found', 
    required: false, 
    description: 'Error message if user data could not be fetched' 
  })
  error?: string;
}

export class RepoActivityDto {
  @ApiProperty({ example: 'awesome-project', description: 'Repository name' })
  repoName: string;

  @ApiProperty({ 
    example: 'An awesome open source project', 
    required: false, 
    description: 'Repository description' 
  })
  description?: string;

  @ApiProperty({ example: 'https://github.com/user/awesome-project', description: 'Repository URL' })
  url: string;

  @ApiProperty({ example: 15, description: 'Number of commits in the last 6 months' })
  commits: number;

  @ApiProperty({ example: 3, description: 'Number of pull requests in the last 6 months' })
  pullRequests: number;

  @ApiProperty({ example: 2, description: 'Number of issues in the last 6 months' })
  issues: number;

  @ApiProperty({ example: 8, description: 'Number of PR comments in the last 6 months' })
  prComments: number;

  @ApiProperty({ example: 5, description: 'Number of issue comments in the last 6 months' })
  issueComments: number;
}

export class UserSummaryDto {
  @ApiProperty({ example: 45, description: 'Total commits across all repositories' })
  totalCommits: number;

  @ApiProperty({ example: 12, description: 'Total pull requests across all repositories' })
  totalPRs: number;

  @ApiProperty({ example: 8, description: 'Total issues across all repositories' })
  totalIssues: number;

  @ApiProperty({ example: 25, description: 'Total PR comments across all repositories' })
  totalPRComments: number;

  @ApiProperty({ example: 18, description: 'Total issue comments across all repositories' })
  totalIssueComments: number;
}

export class UserActivityDto {
  @ApiProperty({ type: UserProfileDto, description: 'User profile information' })
  user: UserProfileDto;

  @ApiProperty({ 
    type: [RepoActivityDto], 
    description: 'List of repositories with activity data' 
  })
  repos: RepoActivityDto[];

  @ApiProperty({ 
    type: UserSummaryDto, 
    required: false, 
    description: 'Summary of user activity across all repositories (null if user had errors)' 
  })
  summary: UserSummaryDto | null;
}

export class GlobalSummaryDto {
  @ApiProperty({ example: 150, description: 'Total commits across all users' })
  totalCommits: number;

  @ApiProperty({ example: 35, description: 'Total pull requests across all users' })
  totalPRs: number;

  @ApiProperty({ example: 22, description: 'Total issues across all users' })
  totalIssues: number;

  @ApiProperty({ example: 75, description: 'Total PR comments across all users' })
  totalPRComments: number;

  @ApiProperty({ example: 45, description: 'Total issue comments across all users' })
  totalIssueComments: number;

  @ApiProperty({ example: 12, description: 'Total number of repositories analyzed' })
  totalRepos: number;

  @ApiProperty({ example: 3, description: 'Number of users with successful data retrieval' })
  successfulUsers: number;

  @ApiProperty({ example: 1, description: 'Number of users with failed data retrieval' })
  failedUsers: number;

  @ApiProperty({ example: 4, description: 'Total number of users analyzed' })
  totalUsers: number;

  @ApiProperty({ 
    example: '2024-01-19 to 2025-07-19', 
    description: 'Time range of the analysis (last 6 months)' 
  })
  analysisTimeframe: string;

  @ApiProperty({ 
    example: 3, 
    description: 'Minimum fork count filter applied to repositories' 
  })
  minForkCountFilter: number;
}

export class GithubActivityResponseDto {
  @ApiProperty({ 
    type: [UserActivityDto], 
    description: 'Array of user activity data' 
  })
  users: UserActivityDto[];

  @ApiProperty({ 
    type: GlobalSummaryDto, 
    description: 'Global summary statistics across all users' 
  })
  globalSummary: GlobalSummaryDto;
}

export class BasicHealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Service status' })
  status: string;

  @ApiProperty({ 
    example: '2025-07-19T10:30:00.000Z', 
    description: 'Current timestamp' 
  })
  timestamp: string;

  @ApiProperty({ 
    example: 3600.5, 
    description: 'Application uptime in seconds' 
  })
  uptime: number;

  @ApiProperty({ 
    example: 'development', 
    description: 'Current environment' 
  })
  environment: string;
}

export class MongoDbStatusDto {
  @ApiProperty({ 
    example: 'connected', 
    description: 'MongoDB connection status',
    enum: ['connected', 'disconnected']
  })
  status: string;

  @ApiProperty({ example: 'localhost', description: 'MongoDB host' })
  host: string;

  @ApiProperty({ example: 'maakaf_home', description: 'Database name' })
  name: string;
}

export class GithubStatusDto {
  @ApiProperty({ 
    example: 'configured', 
    description: 'GitHub token configuration status',
    enum: ['configured', 'missing']
  })
  token: string;
}

export class DependenciesDto {
  @ApiProperty({ type: MongoDbStatusDto, description: 'MongoDB connection status' })
  mongodb: MongoDbStatusDto;

  @ApiProperty({ type: GithubStatusDto, description: 'GitHub API configuration status' })
  github: GithubStatusDto;
}

export class MemoryDto {
  @ApiProperty({ 
    example: 45.67, 
    description: 'Used memory in MB' 
  })
  used: number;

  @ApiProperty({ 
    example: 128.0, 
    description: 'Total allocated memory in MB' 
  })
  total: number;
}

export class DetailedHealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Service status' })
  status: string;

  @ApiProperty({ 
    example: '2025-07-19T10:30:00.000Z', 
    description: 'Current timestamp' 
  })
  timestamp: string;

  @ApiProperty({ 
    example: 3600.5, 
    description: 'Application uptime in seconds' 
  })
  uptime: number;

  @ApiProperty({ 
    example: 'development', 
    description: 'Current environment' 
  })
  environment: string;

  @ApiProperty({ 
    type: DependenciesDto, 
    description: 'Status of external dependencies' 
  })
  dependencies: DependenciesDto;

  @ApiProperty({ 
    type: MemoryDto, 
    description: 'Memory usage information' 
  })
  memory: MemoryDto;
}

export class ValidationErrorDto {
  @ApiProperty({ 
    example: 'usernames must be an array', 
    description: 'Validation error message' 
  })
  message: string;

  @ApiProperty({ 
    example: 'usernames', 
    description: 'Field that caused the validation error' 
  })
  field: string;
}

export class BadRequestResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ 
    example: ['usernames should not be empty', 'usernames must be an array'],
    type: [String],
    description: 'Array of error messages'
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request', description: 'Error type' })
  error: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ 
    example: 'Internal server error', 
    description: 'Error message' 
  })
  message: string;

  @ApiProperty({ example: 'Internal Server Error', description: 'Error type' })
  error: string;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ 
    example: 'Resource not found', 
    description: 'Error message' 
  })
  message: string;

  @ApiProperty({ example: 'Not Found', description: 'Error type' })
  error: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 401, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ 
    example: 'GitHub token not set', 
    description: 'Error message' 
  })
  message: string;

  @ApiProperty({ example: 'Unauthorized', description: 'Error type' })
  error: string;
}

export class RateLimitResponseDto {
  @ApiProperty({ example: 429, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ 
    example: 'GitHub API rate limit exceeded', 
    description: 'Error message' 
  })
  message: string;

  @ApiProperty({ example: 'Too Many Requests', description: 'Error type' })
  error: string;

  @ApiProperty({ 
    example: '2025-07-19T11:00:00.000Z', 
    description: 'When the rate limit resets',
    required: false 
  })
  resetTime?: string;
}