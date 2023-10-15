import { HttpException, Injectable } from '@nestjs/common';
import {
  Ctx,
  InjectBot,
  Update,
  Scene, Start
} from 'nestjs-telegraf';
import {InitScene} from "./scenes/init.scene";
import { Markup, Scenes, Telegraf } from 'telegraf';

@Update()
@Injectable()
export class BotService {
  constructor(
    @InjectBot() private bot: Telegraf<Scenes.SceneContext>,
  ) {
  }

  @Start()
  private async startBot(@Ctx() ctx: Scenes.SceneContext) {
    ctx.scene.enter(InitScene.SCENE_ID);
  }
}
