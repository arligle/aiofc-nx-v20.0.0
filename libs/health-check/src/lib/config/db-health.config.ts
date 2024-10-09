import { IsBoolean } from 'class-validator';
import { BooleanType } from '@aiokit/validation';

export class DbHealthConfig {
  @BooleanType
  @IsBoolean()
  public enabled = true;
}
