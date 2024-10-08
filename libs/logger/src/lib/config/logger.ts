import { IsString, IsBoolean } from 'class-validator';
import { BooleanType } from '@aiokit/validation';

export class LoggerConfig {
  @IsBoolean()
  @BooleanType
  colorize = false;

  @IsBoolean()
  @BooleanType
  prettyLogs = false;

  @IsString()
  defaultLevel = 'info';
}
