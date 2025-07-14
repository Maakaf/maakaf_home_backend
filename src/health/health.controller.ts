import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV'),
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check including dependencies' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async detailedHealthCheck() {
    const mongoStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    const githubToken = this.configService.get('GITHUB_TOKEN') ? 'configured' : 'missing';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV'),
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
