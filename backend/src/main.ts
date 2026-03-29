import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS for frontend (localhost + any local network IP so iPhone/tablet work)
  const localOrigin = (o: string) =>
    o === 'http://localhost:3000' ||
    o === 'http://localhost:3002' ||
    o === 'http://localhost:5173' ||
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(o) ||
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(o) ||
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(o);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || localOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Network access: http://192.168.0.104:${port}`);
}
bootstrap();
