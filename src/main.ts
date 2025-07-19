import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule } from '@nestjs/config';
import { winstonLogger } from './logger';
import { MongooseModule } from '@nestjs/mongoose';
import { GithubModule } from './github/github.module';
import { HealthController } from './health/health.controller';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      validate,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/maakaf_home'),
    GithubModule,
  ],
  controllers: [HealthController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder()
    .setTitle('Maakaf Home API')
    .setDescription(`
      API documentation for Maakaf Home backend service. 
      
      This API provides GitHub activity analysis and health monitoring endpoints.
      
      ## Features:
      - **GitHub Activity Analysis**: Analyze GitHub user activity including commits, pull requests, issues, and comments
      - **Health Monitoring**: Basic and detailed health checks for the application and its dependencies
      - **Caching**: Intelligent caching to reduce GitHub API calls and improve performance
      
      ## Requirements:
      - GitHub Personal Access Token must be configured in environment variables
      - MongoDB connection for data storage and caching
    `)
    .setVersion('1.0')
    .addTag('GitHub', 'GitHub activity and user data operations')
    .addTag('Health', 'Application health monitoring endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .setContact(
      'Maakaf Team',
      'https://github.com/maakaf-org',
      'info@maakaf.org'
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Maakaf Home API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  await app.listen(3000);
  console.log('🚀 NestJS server is running on http://localhost:3000');
  console.log('📚 Swagger docs available at http://localhost:3000/api');
  console.log('💚 Health check available at http://localhost:3000/health');
  console.log('🔍 Detailed health check available at http://localhost:3000/health/detailed');
}

bootstrap();