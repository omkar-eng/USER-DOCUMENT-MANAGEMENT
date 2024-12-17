import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');
  app.use((req, res, next) => {
    logger.log(`Incoming Request: ${req.method} ${req.url}`);
    res.on('finish', () => {
      logger.log(`Response: ${res.statusCode} ${req.method} ${req.url}`);
    });
    next();
  });

  await app.listen(process.env.PORT);
  console.log(`App start on PORT - ${process.env.PORT}`)
}
bootstrap();
