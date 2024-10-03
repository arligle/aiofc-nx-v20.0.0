import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppConfig } from './config/app.config';

/**
 * @description 最基础的Nest启动函数，用于启动Nest应用
 */
export async function bootstrapBaseApp(
  module: any
): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    module,
    new FastifyAdapter()
  );

  const appConfig = app.get(AppConfig);
  if(appConfig.prefix){
    app.setGlobalPrefix(appConfig.prefix);
  };


  const port = appConfig.port ||  process.env['PORT'] || 3000;
  await app.listen(port, '0.0.0.0');
  const url = await app.getUrl();
  Logger.log(
    `App successfully started! Listening on: ${url}/${appConfig.prefix}`,
  );

  return app;
}
