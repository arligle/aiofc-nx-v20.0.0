import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { FastifyInstance } from 'fastify/types/instance';
import { AppConfig } from './config/app.config';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { generateRandomId } from '@aiokit/crypto';
import { fastifyHelmet } from '@fastify/helmet';
import {
  I18nValidationExceptionFilter,
  I18nValidationPipe,
} from '@aiokit/i18n';
import { DEFAULT_VALIDATION_OPTIONS } from '@aiokit/validation';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import {
  AnyExceptionFilter,
  HttpExceptionFilter,
  OverrideDefaultForbiddenExceptionFilter,
  OverrideDefaultNotFoundFilter,
  responseBodyFormatter,
} from '@aiokit/exceptions';
import { setupSwagger, SwaggerConfig } from '@aiokit/swagger-utils';
import { callOrUndefinedIfException } from './utils/functions';

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

// 关于提高 Fastify 与 Express 中间件的兼容性的建议
function applyExpressCompatibilityRecommendations(
  fastifyInstance: FastifyInstance
) {
  // this is a recommendation from fastify to improve compatibility with express middlewares
  fastifyInstance
    .addHook('onRequest', async (req) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.socket['encrypted'] = process.env.NODE_ENV === 'production';
    })
    .decorateReply(
      'setHeader',
      /* istanbul ignore next */ function (name: string, value: unknown) {
        this.header(name, value);
      }
    )
    .decorateReply(
      'end',
      /* istanbul ignore next */ function () {
        this.send('');
      }
    );
}

function setupGlobalFilters(
  app: INestApplication,
  httpAdapterHost: HttpAdapterHost
) {
  app.useGlobalFilters(
    new AnyExceptionFilter(httpAdapterHost as any),
    new OverrideDefaultNotFoundFilter(httpAdapterHost as any),
    new OverrideDefaultForbiddenExceptionFilter(httpAdapterHost as any),
    // todo generalize
    // new PostgresDbQueryFailedErrorFilter(httpAdapterHost as any),
    new HttpExceptionFilter(httpAdapterHost as any),
    new I18nValidationExceptionFilter({
      responseBodyFormatter,
      detailedErrors: true,
    })
  );
}

function setupGlobalInterceptors(app: INestApplication) {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
}
/**
 * @description 最基础的Nest启动函数，用于启动Nest应用
 */
export async function bootstrapFastifyApp(
  module: any
): Promise<NestFastifyApplication> {
  const app = await createNestWebApp(module);
  // 直接访问和操作 Fastify 实例，利用 Fastify 提供的各种功能和插件来扩展和定制你的 NestJS 应用程序。
  const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();
  // 提高 Fastify 与 Express 的兼容性
  applyExpressCompatibilityRecommendations(fastifyInstance);
  // 在 Fastify 应用实例上注册了fastify-helmet 插件，并传递了一个空对象作为配置选项。
  // fastify-helmet 是一个用于增强 HTTP 头安全性的插件。
  // 它基于 Helmet.js，为 Fastify 提供了一组中间件，用于设置各种 HTTP 头，
  // 以帮助保护应用免受一些常见的 Web 安全漏洞的攻击，例如跨站脚本（XSS）攻击和点击劫持。
  app.register(fastifyHelmet, {});
  // 启用应用程序的关闭钩子。在应用程序关闭时执行必要的清理操作，从而提高应用程序的可靠性和稳定性。
  app.enableShutdownHooks();

  // 确保 Fastify 应用程序在启动时正确配置日志记录功能
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();
  // 设置一个全局错误处理器，确保即使在应用程序中发生未捕获的异常时，异常信息也能被记录下来。
  process.on(
    'uncaughtException',
    /* istanbul ignore next */ function (err) {
      // Handle the error safely
      logger.error('Uncaught exception: %o', err);
    }
  );
  // 设置一个全局错误处理器，确保即使在应用程序中发生未处理的 Promise 拒绝时，拒绝信息也能被记录下来。
  process.on(
    'unhandledRejection',
    /* istanbul ignore next */ (reason, promise) => {
      // Handle the error safely
      logger.error(
        'Unhandled Rejection at: Promise: %o, reason: %s',
        promise,
        reason
      );
    }
  );
  // 从依赖注入容器中获取了一个 HttpAdapterHost 实例，确保在需要时能够访问和操作底层的 HTTP 服务器实例。
  const httpAdapterHost = app.get(HttpAdapterHost);
  // 在 Fastify 应用实例上注册了一个全局管道，用于处理请求数据的验证。
  // 并创建了一个 I18nValidationPipe 实例。用于处理国际化（i18n）相关的验证逻辑。
  app.useGlobalPipes(new I18nValidationPipe(DEFAULT_VALIDATION_OPTIONS));

  // 所以首先是全局的，然后是缩小的
  // 确保在应用程序中发生异常时，这些异常会被全局的异常过滤器捕获和处理。
  setupGlobalFilters(app, httpAdapterHost);
  // 确保在应用程序中所有的请求和响应都经过这些全局拦截器的处理。
  setupGlobalInterceptors(app);

  const appConfig = app.get(AppConfig);
  const swaggerConfig = callOrUndefinedIfException(() =>
    app.get(SwaggerConfig)
  );
  // 启用跨域资源共享（CORS）功能，以便在应用程序中处理跨域请求。
  app.enableCors(appConfig.cors);

  if (appConfig.prefix) {
    app.setGlobalPrefix(appConfig.prefix);
  }

  const port = appConfig.port || process.env['PORT'] || 3000;

  if (swaggerConfig instanceof SwaggerConfig) {
    const swaggerSetup = setupSwagger(swaggerConfig, app, appConfig.prefix);
    const swaggerPath = `${appConfig.prefix}${swaggerConfig.swaggerPath}`;

    if (swaggerSetup) {
      logger.log(`Swagger is listening on: http://localhost:9999/${swaggerPath}`);
    } else {
      logger.log(`Swagger is disabled by config, skipping...`);
    }
  } else {
    logger.debug(
      `SwaggerConfig instance is not provided so swagger turned off by default, skipping... Details: %o`,
      swaggerConfig
    );
  }

  await app.listen(port, '0.0.0.0');

  const url = await app.getUrl();

  logger.log(
    `App successfully started! Listening on: ${url}/${appConfig.prefix}`
  );

  return app;
}
