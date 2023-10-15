import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TelegrafExceptionsFilter } from './exceptions/handler-telegraf';
import { Logger, RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.enableShutdownHooks();
  app.useGlobalFilters(new TelegrafExceptionsFilter());
  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(`App is listening http://localhost:${port}`);
}
bootstrap();
