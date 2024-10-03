# Config Library

该库提供了一组用于配置的通用服务和实用程序。
它可以在 aiokit 项目之外使用


该库基于[nestjs-config](https://github.com/Nikaple/nest-typed-config)
所有主要工作都在父库中完成，这只是一个包装器，以使其更易于使用

---

## Installation

```bash
yarn add @aiokit/config
```

---

## Usage

```typescript
import { setupYamlBaseConfigModule } from '@aiokit/config';


@Module({
  imports: [
    setupYamlBaseConfigModule(path.join(__dirname, './assets'), RootConfig),
  ]
})
export class YourAppModule {}


```

---

`./assets` -是一个包含配置文件的文件夹。上面的例子就是这样的代码结构：


```bash                                                                        git(docs/readme_for_each_module↑1|✚1…1
.
├── assets
│     ├── .env-test.yaml
│     └── .env.yaml
├── config
│     └── root.config.ts
└── your-app.module.ts
```

---


## This wrapper has a few additions:

- It has *PROFILES* feature, 所以你可以针对不同的环境有不同的配置。
  -NESTJS_PROFILES -是一个环境变量，用于定义要使用的配置文件
  -默认情况下，没有配置文件（.env），仅使用主要提供的文件名，我们可以在项目目录下自定义一个.env文件
  -配置文件的顺序很重要，它定义了如何合并配置，以防出现任何冲突
  - Example:
    -`NESTJS_PROFILES=dev,local` -将使用 `.env-dev.yaml` 和 `.env-local.yaml` 文件以及基础 `.env.yaml`
    -`NESTJS_PROFILES=dev` -将仅使用 `.env-dev.yaml` 文件和基础 `.env.yaml`
  - 默认情况下，我们建议在 jest config 中设置测试配置文件。在 jest.preset.js 中
  ```javascript
     process.env.NESTJS_PROFILES = 'test';
  ```
- Another adjustments is adding a general alias for RootConfig class, so we can reuse it across various apps in the same way.
  - To inject a config in another library you just need to use common token `ROOT_CONFIG_ALIAS_TOKEN`
  - We leverage NestJS DI use existing feature to provide a config in a common way
      ```typescript
      {
        provide: ROOT_CONFIG_ALIAS_TOKEN,
        useExisting: rootSchemaClass,
      }
      ```
  - 在您的库中，您可以期望此提供程序在全局范围内可用，并且您可以强制此配置来实现您的接口。因此，您将能够很好地解耦应用程序，并声明性地定义您需要在库中使用的配置。
    - Example in your library:
      ```typescript
      import { Inject, Injectable } from '@nestjs/common';
      import { ROOT_CONFIG_ALIAS_TOKEN, RootConfig } from '@aiokit/config';
      import { YourConfigInterface } from './your-config.interface';

      @Injectable()
      export class YourService {
        constructor(
          @Inject(ROOT_CONFIG_ALIAS_TOKEN)
          private readonly config: YourConfigInterface,
        ) {}

        getYourConfig(): YourConfigInterface {
          return this.config.yourConfig;
        }
      }
      ```


## Example config file structure

```yaml
# .env.yaml
isAuthEnabled: ${AUTH_ENABLED:-true}
database:
  host: ${DATABASE_HOST:-127.0.0.1}
  port: ${DATABASE_PORT:-3000}
  table:
    name: ${TABLE_NAME:-users}

databaseAlias:
  host: ${database.host}
  port: ${database.port}
  table:
    name: ${database.table.name}
```

`As you can see you can leverage ENV variables in your config files, or use a value to reference another value from your config file`

Your .env.yaml file is usually huge and contains a lot of configs, so it's not very convenient to use it in your code.
Where the profile files, just overriding some specific things for needed environment

Let's say that for tests we always will be connecting to port `12345`.

You just need to create this file and it will be used for tests, when you set env var `NESTJS_PROFILES=test`:

```yaml
# .env-test.yaml
database:
  port: 12345
```
