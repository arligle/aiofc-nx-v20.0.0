import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AppConfig } from '@aiokit/bootstrap';
import { LoggerConfig } from '@aiokit/logger';
import { SwaggerConfig } from '@aiokit/swagger-utils';
import { I18Config } from '@aiokit/i18n';
import { DbConfig } from '@aiokit/typeorm';


export default class RootConfig {
  @Type(() => LoggerConfig)
  @ValidateNested()
  public readonly logs!: LoggerConfig;

  @Type(() => AppConfig)
  @ValidateNested()
  public readonly app!: AppConfig;

  @Type(() => SwaggerConfig)
  @ValidateNested()
  public readonly swagger!: SwaggerConfig;

  @Type(() => I18Config)
  @ValidateNested()
  public readonly i18!: I18Config;

  @Type(() => DbConfig)
  @ValidateNested()
  public readonly db!: DbConfig;
}
