import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories/categories.service';
import { LoggerMiddleware } from './logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for frontend - allow all origins
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());

  // Add request logging
  app.use(new LoggerMiddleware().use);
  // Called Categories service to seed default categories on app startup
  const categoriesService = app.get(CategoriesService);
  await categoriesService.seedDefaultCategories();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
