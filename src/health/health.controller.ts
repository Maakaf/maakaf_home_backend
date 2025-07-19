import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { BasicHealthResponseDto, DetailedHealthResponseDto } from '../github/github.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Returns basic health status of the application including uptime, environment, and current timestamp'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy and running normally',
    type: BasicHealthResponseDto
  })
  async healthCheck(): Promise<BasicHealthResponseDto> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV') || 'development',
    };
  }

  @Get('detailed')
  @ApiOperation({ 
    summary: 'Detailed health check',
    description: 'Returns comprehensive health status including external dependencies (MongoDB, GitHub API), system memory usage, and application metrics'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health status with dependencies and system information',
    type: DetailedHealthResponseDto
  })
  async detailedHealthCheck(): Promise<DetailedHealthResponseDto> {
    const mongoStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    const githubToken = this.configService.get('GITHUB_TOKEN') ? 'configured' : 'missing';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV') || 'development',
      dependencies: {
        mongodb: {
          status: mongoStatus,
          host: this.connection.host,
          name: this.connection.name,
        },
        github: {
          token: githubToken,
        },
      },
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
