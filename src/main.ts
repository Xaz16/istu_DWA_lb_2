import 'reflect-metadata';
import { BadRequestException, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import  hbs from 'hbs';
import * as swaggerUi from 'swagger-ui-express';
import * as yaml from 'js-yaml';
import { AppModule } from './app.module';

function formatValidationErrors(
  errors: ValidationError[],
  parent = '',
): { type: string; path: string; msg: string }[] {
  const out: { type: string; path: string; msg: string }[] = [];
  for (const validationError of errors) {
    const path = parent ? `${parent}.${validationError.property}` : validationError.property;
    if (validationError.constraints) {
      out.push({
        type: 'field',
        path,
        msg: Object.values(validationError.constraints).join(', '),
      });
    }
    if (validationError.children?.length) {
      out.push(...formatValidationErrors(validationError.children, path));
    }
  }
  return out;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, 'views', 'partials'));
  app.useStaticAssets(join(__dirname, 'assets'), { prefix: '/assets/' });
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
      { path: 'api-docs', method: RequestMethod.ALL },
      { path: 'api-docs/(.*)', method: RequestMethod.ALL },
      { path: 'login', method: RequestMethod.GET },
      { path: 'login', method: RequestMethod.POST },
      { path: 'logout', method: RequestMethod.GET },
      { path: 'admin', method: RequestMethod.GET },
      { path: 'login.html', method: RequestMethod.GET },
      { path: 'admin.html', method: RequestMethod.GET },
      { path: 'assets', method: RequestMethod.GET },
      { path: 'assets/(.*)', method: RequestMethod.GET },
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({ errors: formatValidationErrors(errors) }),
    }),
  );
  const openApiPath = join(process.cwd(), 'src', 'docs', 'openapi.yaml');
  const openApiSpec = yaml.load(readFileSync(openApiPath, 'utf8')) as Record<string, unknown>;
  const httpApp = app.getHttpAdapter().getInstance();
  httpApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server listening on http://0.0.0.0:${port}`);
}

bootstrap();
