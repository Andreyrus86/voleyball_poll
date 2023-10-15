import {Action, Ctx, InjectBot, Scene, SceneEnter, SceneLeave, Sender,} from 'nestjs-telegraf';
import {Markup, Scenes, Telegraf} from 'telegraf';
import {UserService} from '../../user/user.service';
import {PollService} from "../../polls/poll.service";

@Scene(InitScene.SCENE_ID)
export class InitScene {
  public static readonly SCENE_ID = 'INIT_TYPE_SCENE_ID';
  protected stepsWaiting: number = 10;
  protected lastPublishedPollId: number;

  constructor(
      @InjectBot() private bot: Telegraf<Scenes.SceneContext>,
      private userService: UserService, private pollService: PollService) {}

  @SceneEnter()
  async onSceneEnter(
    @Ctx() ctx: Scenes.SceneContext,
    @Sender('first_name') firstName: string,
    @Sender('id') userId: number,
  ) {
    console.debug('FUCK');
    this.goLoop(ctx);
  }

  @Action('NextStep')
  async NextStep(@Ctx() ctx) {
    await ctx.answerCbQuery();
    const user = ctx.update.callback_query.from;

    if (this.lastPublishedPollId === undefined) {
      return;
    }
    console.debug(user);
    //this.userService.insertOrIgnorePollChoice(this.lastPublishedPollId)
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Scenes.SceneContext) {
    //console.log('location scene left');
    //await ctx.deleteMessage();
  }

  private prepareButtons() {
    const buttons = [];
    buttons.push([Markup.button.callback('Играю!', 'NextStep')]);

    return buttons;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeSleep() {
    await this.sleep(1000 * 60);
  }

  private async goLoop(ctx) {
    while (true) {
      this.makeSleep();

      const dayOfWeekDigit = new Date().getDay();
      const currentHours = new Date().getHours();
      console.debug(dayOfWeekDigit, currentHours);
      if (dayOfWeekDigit != 2) {
        continue;
      }

      if (this.pollService.isAlreadyPublished()['cnt'] === undefined || this.pollService.isAlreadyPublished()['cnt'] > 0) {
        continue;
      }

      this.lastPublishedPollId = await this.preparePoll();
      const pollMessage = this.showPoll();
      //this.pollService.setMessageId(pollMessage.id, pollId);

      console.debug(ctx, pollMessage);
    }
  }

  async showPoll() {
    const buttons = this.prepareButtons();

    await this.bot.telegram.sendMessage(1,`Кто готов играть в пятницу с 18:00 до 20:00? Максимум 6 человек. Первые 6 отметившихся - играют.<br>
      Кто 7-й, 8-й и т.д - Вы попали в резерв в порядке очереди. Если кто-то из отмеившихся раньше не сможет прийти, то этот человек
      Вас лично оповестит и Вы сможете заменить его.
      :`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons),
    });
  }

  private async preparePoll(): Promise<any> {
    return this.pollService.insertOrIgnorePoll();
  }
}
