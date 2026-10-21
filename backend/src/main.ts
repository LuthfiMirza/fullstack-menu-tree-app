import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get('port', { infer: true }) || 3001;
  const frontendOrigin =
    configService.get('frontendOrigin', { infer: true }) ||
    'http://localhost:3000';

  // Global routing prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: frontendOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger OpenAPI documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('STK Menu Tree API')
    .setDescription(
      'REST API for STK Fullstack Menu Tree System with recursive adjacency list structure',
    )
    .setVersion('1.0.0')
    .addTag('menus', 'Menu hierarchy and node management')
    .addTag('health', 'Service health check')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}/api`);
  logger.log(
    `Swagger documentation available at http://localhost:${port}/api/docs`,
  );
}

bootstrap();
