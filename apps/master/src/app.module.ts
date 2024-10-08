import { Module } from '@nestjs/common';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import RootConfig from './config/root.config';
import { setupYamlBaseConfigModule } from '@aiokit/config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    setupYamlBaseConfigModule(__dirname, RootConfig),
    LoggerModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
