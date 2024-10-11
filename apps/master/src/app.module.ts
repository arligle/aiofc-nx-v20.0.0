import { Module } from '@nestjs/common';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import RootConfig from './config/root.config';
import { setupYamlBaseConfigModule } from '@aiokit/config';
import { setupLoggerModule } from '@aiokit/logger';
import { Logger } from 'nestjs-pino';
import { setupTypeormModule } from '@aiokit/typeorm';
import * as Entities from './database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { setupI18NModule } from '@aiokit/i18n';

@Module({
  imports: [
    setupYamlBaseConfigModule(__dirname, RootConfig),
    setupI18NModule(__dirname),
    setupLoggerModule(),
    TypeOrmModule.forFeature(Object.values(Entities)),
    setupTypeormModule()
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
