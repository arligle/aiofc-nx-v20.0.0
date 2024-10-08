import { ClsModule, ClsModuleOptions } from 'nestjs-cls';
import { DynamicModule } from '@nestjs/common';

export function setupClsModule(clsOptions?: ClsModuleOptions): DynamicModule {
  return ClsModule.forRoot({
    global: true,
    middleware: {
      mount: true,
      generateId: true,
      idGenerator: (req) => req.id.toString(),
    },
    ...clsOptions,
  });
}
