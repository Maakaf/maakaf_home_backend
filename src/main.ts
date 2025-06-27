import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule } from '@nestjs/config';
import { GithubController } from './github.controller';
import { GithubActivityService } from './github-activity.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [GithubController],
  providers: [GithubActivityService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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