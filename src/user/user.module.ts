import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { WorkRepository } from './work.repository';
import {PollService} from "../polls/poll.service";

@Module({
  imports: [DatabaseModule],
  providers: [UserService, UserRepository, WorkRepository, PollService],
  exports: [UserService, PollService, UserRepository],
})
export class UserModule {}
