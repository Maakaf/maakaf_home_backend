import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommitsService } from './commits.service';
import { Commit } from './commits.schema';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('commits')
export class CommitsController {
  constructor(private readonly commitsService: CommitsService) {}

  @Get()
  async findAll(): Promise<Commit[]> {
    return this.commitsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new commit' })
  @ApiBody({
    description: 'Commit data',
    required: true,
    schema: {
      example: {
        repo: 'Hello-World',
        repoOwner: 'octocat',
        sha: '7fd1a60b01f91b314f59951d0416a1bfa8b6b8a7',
        committedDate: '2024-06-01T12:34:56Z',
        author: 'octocat',
        message: 'Initial commit',
        rawData: { example: 'raw commit data' }
      }
    }
  })
  async create(@Body() commitData: Partial<Commit>): Promise<Commit> {
    return this.commitsService.create(commitData);
  }
}
