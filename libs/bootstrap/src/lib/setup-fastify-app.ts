import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppConfig } from './config/app.config';
import { Logger } from 'nestjs-pino';
import { generateRandomId } from '@aiokit/crypto';

const REQUEST_ID_HEADER = 'x-request-id';

function buildFastifyAdapter(): FastifyAdapter {
  return new FastifyAdapter({
    genReqId: (req: { headers: { [x: string]: any } }) => {
      const requestId = req.headers[REQUEST_ID_HEADER];
      return requestId || generateRandomId();
    },
    bodyLimit: 10_485_760,
  });
}

async function createNestWebApp(module: any) {
  return NestFactory.create<NestFastifyApplication>(
    module,
    buildFastifyAdapter(),
    {}
  );
}
/**
 * @description 最基础的Nest启动函数，用于启动Nest应用
 */
export async function bootstrapFastifyApp(
  module: any
): Promise<NestFastifyApplication> {
  // const app = await NestFactory.create<NestFastifyApplication>(
  //   module,
  //   new FastifyAdapter()
  // );
  const app = await createNestWebApp(module);
  const appConfig = app.get(AppConfig);
  if (appConfig.prefix) {
    app.setGlobalPrefix(appConfig.prefix);
  }

  const port = appConfig.port || process.env['PORT'] || 3000;
  await app.listen(port, '0.0.0.0');
  const url = await app.getUrl();

  // 确保 Fastify 应用程序在启动时正确配置日志记录功能
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();
  logger.log(
    `App successfully started! Listening on: ${url}/${appConfig.prefix}`
  );

  return app;
}
