import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import { ROOT_CONFIG_ALIAS_TOKEN } from './constants';
import { SetupConfigOptions } from './vo/setup-config-options';
import { getExistingFilePaths } from './utils/get-existing-file-paths';
import type { DynamicModule, Type } from '@nestjs/common';
/**
 * @description 动态生成基于nest-typed-config的配置模块
 * @export
 * @param baseDir
 * @param rootSchemaClass
 * @param [options]
 * @return  DynamicModule
}
 */
export function setupYamlBaseConfigModule(
  baseDir: string,
  rootSchemaClass: Type<unknown>,
  options?: SetupConfigOptions,
) : DynamicModule {
  const existingFilePaths = getExistingFilePaths(
    baseDir,
    options?.folderName,
    options?.baseFileName,
    options?.profiles,
  );

  const dynamicModule = TypedConfigModule.forRoot({
    schema: rootSchemaClass,
    isGlobal: true,
    load: existingFilePaths.map((filePath) => {
      return fileLoader({
        absolutePath: filePath,
        ignoreEnvironmentVariableSubstitution: false,
        ignoreEmptySearchPlaces: false,
      });
    }),
  });

  return {
    ...dynamicModule,
    providers: [
      ...(dynamicModule.providers ?? []),
      {
        provide: ROOT_CONFIG_ALIAS_TOKEN,
        useExisting: rootSchemaClass,
      },
    ],
    exports: [...(dynamicModule.exports ?? []), ROOT_CONFIG_ALIAS_TOKEN],
  };
}
