import { DiskHealthConfig } from './disk-health.config';
import { DbHealthConfig } from './db-health.config';
import { ValidateNestedProperty } from '@aiokit/validation';

export class HealthConfig {
  @ValidateNestedProperty({ classType: DiskHealthConfig })
  public readonly disk!: DiskHealthConfig;

  @ValidateNestedProperty({ classType: DbHealthConfig })
  public readonly db!: DbHealthConfig;
}
