import { Inject, Injectable } from '@nestjs/common';
import { Markup, Scenes, Telegraf } from 'telegraf';
import {
  Action,
  Command,
  Ctx,
  InjectBot,
  Sender,
  Update,
} from 'nestjs-telegraf';

import {UserRepository} from "../user/user.repository";

@Update()
@Injectable()
export class PollService {
  constructor(
    @InjectBot() private bot: Telegraf<Scenes.SceneContext>,
    private userRepository: UserRepository,
  ) {}

  insertOrIgnorePoll(
  ): Promise<any> {
    return this.userRepository.insertOrIgnorePoll();
  }

  setMessageId(
      telegramMessageId: number,
      pollId: number,
  ): Promise<any> {
    return this.userRepository.setMessageId(telegramMessageId, pollId);
  }

  isAlreadyPublished() {
    return this.userRepository.isAlreadyPublished();
  }
}
