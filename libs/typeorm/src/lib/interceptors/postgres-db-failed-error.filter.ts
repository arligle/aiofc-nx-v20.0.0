import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@aiokit/i18n';
import { QueryFailedError } from 'typeorm';
import { toCapitalizedWords } from '@aiokit/string-utils';
import { ErrorResponse } from '@aiokit/exceptions';

@Catch(QueryFailedError)
export class PostgresDbQueryFailedErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const i18n = I18nContext.current(host);

    let response;

    switch ((exception.driverError as any)?.code) {
      // already exists exception from postgres either by unique constraint or primary key
      case '23505': {
        response = {
          status: HttpStatus.CONFLICT,
          type: 'todo implement link to the docs, get from config',
          title:
            i18n?.translate('exception.CONFLICT.TITLE') || 'Conflict Error',
          detail:
            i18n
              ?.translate('exception.CONFLICT.ENTITY_ALREADY_EXISTS', {
                args: {
                  entityName: toCapitalizedWords((exception.driverError as any)?.table),
                },
              })
              .toString() || 'Object already exists',
          instance: ctx.getRequest().id,
        } satisfies ErrorResponse;
        break;
      }
      default: {
        response = {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          type: 'todo implement link to the docs, get from config',
          title:
            i18n?.translate('exception.INTERNAL_ERROR.TITLE') ||
            'Internal Error',
          detail:
            i18n
              ?.translate('exception.INTERNAL_ERROR.GENERAL_DETAIL')
              .toString() || 'Internal Server Error',
          instance: ctx.getRequest().id,
        } satisfies ErrorResponse;
        break;
      }
    }

    httpAdapter.reply(
      ctx.getResponse(),
      response satisfies ErrorResponse,
      response.status,
    );
  }
}
