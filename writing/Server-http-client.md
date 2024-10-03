# Server Http Client

该库为 Nestjs 应用程序提供了高级 http 客户端。

它设计用于与其他 Nestjs 应用程序或任何其他 http 服务进行通信。

它需要安装[Axios](https://axios-http.com/docs/intro)，并且依赖它

---


## Features

- 它具有内置的可配置重试机制（线性、静态或指数）
- 内置可配置的断路器机制
- 使用本地内存缓存来存储电路状态的断路器
- 断路器和重试机制可以根据请求进行配置，也可以一起配置，但是您需要清楚地了解配置两者时系统的行为方式
- 该库提供了InternalProxyHttpExceptionFilter，它将任何异常转换为InternalProxyHttpException

  这对于服务之间的内部通信很有用，因此如果您调用另一个服务，并且它返回任何错误，它将转换为InternalProxyHttpException，您可以根据需要处理它，但在大多数情况下，如果您的任何内部服务返回错误您应该将其按原样返回给客户。它简化了微服务之间通信的错误处理。
- 它具有内置的可配置超时机制，您不想挂起 30 秒等待服务器响应。
- 它依赖 ClsService 在服务之间进行身份验证令牌和请求 ID 传播，因此您无需担心它，它会自动为您完成。

Note:

您很少需要直接使用此库，它由代码生成器使用，为您的应用程序和库创建自动生成的 http 客户端。

---

## Installation

```bash
yarn add @aiokit/server-http-client
```

---

## Create http client


```typescript

@Module({

  providers: [
    {
      provide: 'AXIOS',
      useFactory: (cls: ClsService<UserRequestClsStore>) => {
        return createAxiosInstance(cls, {
          url: 'http://localhost:54345',
          timeout: 1000,
          serviceName: 'sample',
        });
      },
      inject: [ClsService],
    },
  ],
  imports: [ClsModule],
})
export class YourAppModule {}
```

## Inject and use

```typescript

@Controller('sample')
export class SampleController {
  constructor(@Inject('AXIOS') private readonly axios: AxiosInstance) {}
}
```


