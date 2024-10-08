import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AppConfig } from '@aiokit/bootstrap';
import { LoggerConfig } from '@aiokit/logger';


export default class RootConfig {
  @Type(() => LoggerConfig)
  @ValidateNested()
  public readonly logs!: LoggerConfig;

  @Type(() => AppConfig)
  @ValidateNested()
  public readonly app!: AppConfig;

}
