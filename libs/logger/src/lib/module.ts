/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClsService, ClsStore } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'node:http';

import { LoggerConfig } from './config/logger';
import { DynamicModule } from '@nestjs/common';
import path from 'node:path';
/**
 * @description 配置和初始化日志记录模块
 * @export
 * @template ClsType
 * @param [customProps=() => ({})]
 * @return {*}
 */
export function setupLoggerModule<ClsType extends ClsStore>(
  // 生成自定义的请求属性，默认为空对象
  customProps: (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    clsService?: ClsService<ClsType>
  ) => Record<string, string> = () => ({})
): DynamicModule {
  // 返回一个动态模块,配置了日志模块的异步初始化
  return LoggerModule.forRootAsync({
    useFactory: async (
      loggerConfig: LoggerConfig,
      clsService?: ClsService<ClsType>
    ) => {
      return {
        // 将上下文重命名为 'class'
        renameContext: 'class',
        // 配置 Pino HTTP 日志记录器，包括格式化器、自定义属性、序列化器和自定义消息
        pinoHttp: {
          formatters: {
            level: (label) => {
              return { level: label };
            },
          },
          // 使用传入的 customProps 函数生成自定义请求属性。
          customProps: (req, res) => {
            return customProps(req, res, clsService);
          },
          // 定义成功请求的日志对象，包括请求 ID 和响应时间。
          customSuccessObject: (
            req: IncomingMessage,
            res: ServerResponse,
            val: any
          ) => {
            return {
              reqId: req.id,
              responseTime: val.responseTime,
            };
          },
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
            }),
          },
          // 定义错误请求的日志对象，包括状态消息、状态码和错误信息。
          customErrorObject: (
            req: IncomingMessage,
            res: ServerResponse,
            error: Error,
            val: any
          ) => {
            return {
              statusMessage: res.statusMessage,
              statusCode: res.statusCode,
              err: val.err,
            };
          },
          // 定义接收到请求时的日志消息。
          customReceivedMessage: (req: IncomingMessage) => {
            return `Call Endpoint: ${req.method} ${req.url}`;
          },
          // 定义成功处理请求后的日志消息。
          customSuccessMessage: (
            req: IncomingMessage,
            res: ServerResponse,
            responseTime: number
          ) => {
            return `Finished Endpoint: ${req.method} ${req.url} for ${responseTime}ms`;
          },
          // 定义错误请求的日志对象，包括状态消息、状态码和错误信息。
          customErrorMessage: (
            req: IncomingMessage,
            res: ServerResponse,
            error: Error
          ) => {
            return `Failed Endpoint: ${req.method} ${req.url} Error - ${error.message}.`;
          },
          // 根据响应状态码和错误信息动态设置日志级别。
          customLogLevel: function (req, res, err) {
            if (res.statusCode >= 400 && res.statusCode < 500) {
              return 'info';
            }
            if (res.statusCode >= 500 || err) {
              return 'error';
            }
            if (res.statusCode >= 300 && res.statusCode < 400) {
              return 'silent';
            }
            return 'info';
          },
          // 设置为 true，以静默请求日志记录。
          quietReqLogger: true,
          // 设置为 true，启用自动日志记录。
          autoLogging: true,
          // 定义其他自定义请求属性
          // 设置日志的级别
          level: loggerConfig.defaultLevel,
          // install 'pino-pretty' package in order to use the following option
          // 如果 loggerConfig.prettyLogs 为 true，则使用 pino-pretty 格式化日志输出。
          transport: loggerConfig.prettyLogs
            ? {
                target: 'pino-pretty',
                // options: {
                //   // 日志文件路径
                //   destination: path.join(__dirname, '../../logs', 'app.log'),
                //   mkdir: true, // 如果目录不存在，自动创建
                // },
              }
            : undefined,
        },
      };
    },
    inject: [LoggerConfig, { token: ClsService, optional: true }],
    providers: [],
  });
}
