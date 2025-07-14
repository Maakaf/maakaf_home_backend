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
    .setDescription('API documentation for Maakaf Home')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('NestJS server is running on http://localhost:3000');
  console.log('Swagger docs available at http://localhost:3000/api');
}

bootstrap(); 