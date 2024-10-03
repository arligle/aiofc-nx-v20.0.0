初始化的配置(共有三个地方)

根目录下

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2021",
    "module": "commonjs",
    "lib": ["es2021", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {}
  },
  "exclude": ["node_modules", "tmp"]
}
```

apps/master/tsconfig.app.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "types": [
      "node"
    ],
    "emitDecoratorMetadata": true,
    "target": "es2021"
  },
  "exclude": [
    "jest.config.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.ts"
  ],
  "include": [
    "src/**/*.ts"
  ]
}

```

apps/master/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "compilerOptions": {
    "esModuleInterop": true
  }
}

```



[`tsconfig.base.json`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Farligle%2Faiofc%2Faiomix-sources%2Faiofc-nest%2Ftsconfig.base.json%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22c662653c-277e-47ba-9959-77640fbaef83%22%5D "/home/arligle/aiofc/aiomix-sources/aiofc-nest/tsconfig.base.json") 文件用于配置 TypeScript 编译器的行为和选项。以下是该文件中各个配置项的详细解释：

首先，`"compileOnSave": false` 表示在保存文件时不会自动编译项目。这通常用于提高开发效率，避免每次保存都触发编译。

在 `"compilerOptions"` 部分，`"rootDir": "."` 指定了项目的根目录为当前目录。`"sourceMap": true` 启用源映射文件的生成，这对于调试非常有用，因为它允许你在调试工具中查看 TypeScript 源代码，而不是编译后的 JavaScript。

`"declaration": false` 表示不会生成 `.d.ts` 声明文件。`"moduleResolution": "node"` 指定模块解析策略为 Node.js 风格，这对于使用 npm 包非常重要。

`"emitDecoratorMetadata": true` 和 `"experimentalDecorators": true` 启用了装饰器的支持，这是 TypeScript 的实验性特性，常用于框架如 Angular。

`"importHelpers": true` 启用后，TypeScript 会使用 `tslib` 来减少生成代码的大小。`"target": "es2015"` 指定编译后的 JavaScript 目标版本为 ES2015。`"module": "esnext"` 指定模块系统为 ESNext，这通常用于现代 JavaScript 项目。

`"lib": ["es2020", "dom"]` 指定了编译时包含的库文件，[`es2020`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Farligle%2Faiofc%2Faiomix-sources%2Faiofc-nest%2Ftsconfig.base.json%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A12%2C%22character%22%3A13%7D%7D%5D%2C%22c662653c-277e-47ba-9959-77640fbaef83%22%5D "Go to definition") 和 [`dom`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Farligle%2Faiofc%2Faiomix-sources%2Faiofc-nest%2Ftsconfig.base.json%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A12%2C%22character%22%3A23%7D%7D%5D%2C%22c662653c-277e-47ba-9959-77640fbaef83%22%5D "Go to definition") 分别表示 ECMAScript 2020 和 DOM API。

`"skipLibCheck": true` 和 `"skipDefaultLibCheck": true` 用于跳过库文件的类型检查，这可以加快编译速度。

`"baseUrl": "."` 设置模块解析的基本路径为当前目录，`"paths": {}` 则用于配置模块路径映射，目前为空。

最后，`"exclude": ["node_modules", "tmp"]` 指定了编译时要排除的目录，[`node_modules`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Farligle%2Faiofc%2Faiomix-sources%2Faiofc-nest%2Fnode_modules%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22c662653c-277e-47ba-9959-77640fbaef83%22%5D "/home/arligle/aiofc/aiomix-sources/aiofc-nest/node_modules") 和 [`tmp`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fhome%2Farligle%2Faiofc%2Faiomix-sources%2Faiofc-nest%2Ftsconfig.base.json%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A18%2C%22character%22%3A31%7D%7D%5D%2C%22c662653c-277e-47ba-9959-77640fbaef83%22%5D "Go to definition") 目录中的文件不会被编译。

这些配置项共同作用，确保 TypeScript 编译器能够正确处理项目中的 TypeScript 代码，并生成符合项目需求的 JavaScript 文件。
