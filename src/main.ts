import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { HttpErrorFilter } from './shared/filters/http_error.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '200kb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            
      forbidNonWhitelisted: true, 
      transform: true,            
    }),
  );
  
  app.useGlobalFilters(new HttpErrorFilter());


  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
