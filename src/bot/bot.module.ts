import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { PollService } from '../polls/poll.service';
import { UserModule } from '../user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { TelegrafExceptionsFilter } from '../exceptions/handler-telegraf';
import { InitScene } from './scenes/init.scene';
import { LocationModule } from './locations/location.module';
import { LocationService } from './locations/location.service';
import { ConfigService } from '@nestjs/config';
import {UserService} from "../user/user.service";
const LocalSession = require('telegraf-session-local');

const memoryStorage = new LocalSession({ storage: LocalSession.storageMemory });
const configService = new ConfigService();
@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => {
        const token = configService.get('BOT_TOKEN');
        return {
          token: token,
          middlewares: [memoryStorage],
          /*options: {
            handlerTimeout: Infinity,
          }*/
        };
      },
    }),
    UserModule,
    LocationModule,
  ],
  exports: [BotService],
  providers: [
    {
      provide: APP_FILTER,
      useClass: TelegrafExceptionsFilter,
    },
    BotService,
    InitScene,
    PollService,
    UserService,
    LocationService,
  ],
})
export class BotModule {}
