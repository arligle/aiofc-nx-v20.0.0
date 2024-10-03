import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AppConfig } from '@aiokit/bootstrap';


export default class RootConfig {
  @Type(() => AppConfig)
  @ValidateNested()
  public readonly app!: AppConfig;

}
