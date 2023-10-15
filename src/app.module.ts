import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { PollService } from './polls/poll.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import {UserService} from "./user/user.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule,
    DatabaseModule,
    UserModule,
    HealthModule,
  ],
  providers: [PollService, UserService],
})
export class AppModule {}
