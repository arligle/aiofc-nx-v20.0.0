import {
  ClassSerializerInterceptor,
  INestApplication,
  VersioningType,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { useContainer } from 'class-validator';
import { FastifyInstance } from 'fastify/types/instance';
import {
  I18nValidationExceptionFilter,
  I18nValidationPipe,
} from '@aiokit/i18n';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { getTransactionalContext } from 'typeorm-transactional/dist/common';
import { generateRandomId } from '@aiokit/crypto';
import { runSeeders } from 'typeorm-extension';
import {
  AnyExceptionFilter,
  HttpExceptionFilter,
  OverrideDefaultForbiddenExceptionFilter,
  OverrideDefaultNotFoundFilter,
} from '@aiokit/exceptions';
import { DEFAULT_VALIDATION_OPTIONS } from '@aiokit/validation';
import { AppConfig } from './config/app.config';
import { setupSwagger, SwaggerConfig } from '@aiokit/swagger-utils';
import {
  DbConfig,
  PostgresDbQueryFailedErrorFilter,
  TYPEORM_FACTORIES_TOKEN,
  TYPEORM_SEEDERS_TOKEN,
} from '@aiokit/typeorm';
import { responseBodyFormatter } from '@aiokit/exceptions';
import { fastifyHelmet } from '@fastify/helmet';
import { DataSource } from 'typeorm';
import { callOrUndefinedIfException } from './utils/functions';
import type { TestingModule } from '@nestjs/testing';
import { REQUEST_ID_HEADER } from '@aiokit/server-http-client';

// const REQUEST_ID_HEADER = 'x-request-id';

// 注意：这里的export并不是为了导出给别的模块使用，而是为了把函数加入到module.exports对象
export function buildFastifyAdapter() : FastifyAdapter {
  return new FastifyAdapter({
    genReqId: (req: { headers: { [x: string]: any } }) => {
      const requestId = req.headers[REQUEST_ID_HEADER];
      return requestId || generateRandomId();
    },
    bodyLimit: 10_485_760,
  });
}

export function setupGlobalFilters(
  app: INestApplication,
  httpAdapterHost: HttpAdapterHost,
) {
  app.useGlobalFilters(
    new AnyExceptionFilter(httpAdapterHost as any),
    new OverrideDefaultNotFoundFilter(httpAdapterHost as any),
    new OverrideDefaultForbiddenExceptionFilter(httpAdapterHost as any),
    // todo generalize
    new PostgresDbQueryFailedErrorFilter(httpAdapterHost as any),
    new HttpExceptionFilter(httpAdapterHost as any),
    new I18nValidationExceptionFilter({
      responseBodyFormatter,
      detailedErrors: true,
    }),
    // 加入更多的Filter
  );
}

export async function createNestWebApp(
  module: any | TestingModule,
  originalModule?: any,
) : Promise<NestFastifyApplication> {
  const isTestingModule = module?.constructor?.name === 'TestingModule';

  if (isTestingModule && originalModule === undefined) {
    throw new Error(
      'If you are using TestingModule, you must pass the original module as the second argument',
    );
  }

  return isTestingModule
    ? (module as TestingModule).createNestApplication<NestFastifyApplication>(
        buildFastifyAdapter(),
      )
    : await NestFactory.create<NestFastifyApplication>(
        module,
        buildFastifyAdapter(),
        {},
      );
}
// 关于提高 Fastify 与 Express 中间件的兼容性的建议
export function applyExpressCompatibilityRecommendations(
  fastifyInstance: FastifyInstance,
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
      },
    )
    .decorateReply(
      'end',
      /* istanbul ignore next */ function () {
        this.send('');
      },
    );
}

function setupGlobalInterceptors(app: INestApplication) {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
}

export async function runDatabaseSeeders(
  app: INestApplication,
  logger: Logger,
  shouldRunSeeds: boolean,
) {
  if (!shouldRunSeeds) {
    return;
  }

  const ds = callOrUndefinedIfException(() => app.get(DataSource));
  const seeders = app.get(TYPEORM_SEEDERS_TOKEN);
  const factories = app.get(TYPEORM_FACTORIES_TOKEN);

  if (seeders.length === 0) {
    return logger.warn(
      'Warning: No seeders found. Ensure you have provided seeders if you are expecting database seeding to occur.',
    );
  }

  if (ds instanceof DataSource) {
    await runSeeders(ds, {
      seeds: seeders,
      factories,
    });
  } else {
    logger.warn(
      'Seems like run seeds is enabled, but there is no data source provided, this seems like a mistake. Please review or disable seed run',
    );
  }
}

export async function bootstrapBaseWebApp(
  module: any | TestingModule,
  originalModule?: any,
) {
  // todo 等待这个包中的pr被合并
  //  转换为使用 AsyncCls 而不是 ClsHook
  const transactionalContext = getTransactionalContext();

  // 这是测试所必需的，以防止多次初始化
  if (!transactionalContext) {
    initializeTransactionalContext();
  }

  const app = await exports.createNestWebApp(module, originalModule);
  // 直接访问和操作 Fastify 实例，利用 Fastify 提供的各种功能和插件来扩展和定制你的 NestJS 应用程序。
  const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();
  // 提高 Fastify 与 Express 的兼容性
  exports.applyExpressCompatibilityRecommendations(fastifyInstance);
  // 在 Fastify 应用实例上注册了fastify-helmet 插件，并传递了一个空对象作为配置选项。
  // fastify-helmet 是一个用于增强 HTTP 头安全性的插件。
  // 它基于 Helmet.js，为 Fastify 提供了一组中间件，用于设置各种 HTTP 头，
  // 以帮助保护应用免受一些常见的 Web 安全漏洞的攻击，例如跨站脚本（XSS）攻击和点击劫持。
  app.register(fastifyHelmet, {});
  // 配置了依赖注入容器，并设置了一个选项以在发生错误时回退到默认行为。主要是为了兼容测试环境
  useContainer(app.select(originalModule || module), {
    fallbackOnErrors: true,
  });
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
    },
  );
  // 设置一个全局错误处理器，确保即使在应用程序中发生未处理的 Promise 拒绝时，拒绝信息也能被记录下来。
  process.on(
    'unhandledRejection',
    /* istanbul ignore next */ (reason, promise) => {
      // Handle the error safely
      logger.error(
        'Unhandled Rejection at: Promise: %o, reason: %s',
        promise,
        reason,
      );
    },
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
  const dbConfig = callOrUndefinedIfException(() => app.get(DbConfig));
  const swaggerConfig = callOrUndefinedIfException(() =>
    app.get(SwaggerConfig),
  );
  app.enableCors(appConfig.cors);

  if (appConfig.prefix) {
    app.setGlobalPrefix(appConfig.prefix);
  }

  app.enableVersioning({
    type: VersioningType.URI,
  });

  if (swaggerConfig instanceof SwaggerConfig) {
    const swaggerSetup = setupSwagger(swaggerConfig, app, appConfig.prefix);
    const swaggerPath = `${appConfig.prefix}${swaggerConfig.swaggerPath}`;

    if (swaggerSetup) {
      logger.log(`Swagger is listening on： ${swaggerPath}`);
    } else {
      logger.log(`Swagger is disabled by config, skipping...`);
    }
  } else {
    logger.debug(
      `SwaggerConfig instance is not provided so swagger turned off by default, skipping... Details: %o`,
      swaggerConfig,
    );
  }

  if (dbConfig instanceof DbConfig) {
    await exports.runDatabaseSeeders(app, logger, dbConfig.runSeeds);
  }

  await app.listen(appConfig.port, '0.0.0.0');
  const url = await app.getUrl();

  logger.log(`Swagger-docs Listening on: http://localhost:${appConfig.port}/${appConfig.prefix}/swagger`);
  logger.log(`App successfully started. Listening on: ${url}/${appConfig.prefix}`);

  return app;
}
