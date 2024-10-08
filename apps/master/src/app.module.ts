import { Module } from '@nestjs/common';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import RootConfig from './config/root.config';
import { setupYamlBaseConfigModule } from '@aiokit/config';
// import { LoggerModule } from 'nestjs-pino';
import { setupLoggerModule } from '@aiokit/logger';
import { Logger } from 'nestjs-pino';

@Module({
  imports: [
    setupYamlBaseConfigModule(__dirname, RootConfig),
    // LoggerModule.forRoot()
    setupLoggerModule(),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
