import {Action, Ctx, InjectBot, Scene, SceneEnter, SceneLeave, Sender,} from 'nestjs-telegraf';
import {Markup, Scenes, Telegraf} from 'telegraf';
import {UserService} from '../../user/user.service';
import {PollService} from "../../polls/poll.service";

@Scene(InitScene.SCENE_ID)
export class InitScene {
  public static readonly SCENE_ID = 'INIT_TYPE_SCENE_ID';
  //public static CHANNEL_ID = -4028704815;
  public static CHANNEL_ID = -1001936026117;
  protected stepsWaiting: number = 10;
  protected lastPublishedPollId: number;
  protected lastPublishedPollMessageId: number;
  protected initialized: boolean = false;

  constructor(
      @InjectBot() private bot: Telegraf<Scenes.SceneContext>,
      private userService: UserService, private pollService: PollService) {}

  @SceneEnter()
  async onSceneEnter(
    @Ctx() ctx: Scenes.SceneContext,
    @Sender('first_name') firstName: string,
    @Sender('id') userId: number,
  ) {
      console.debug('INSTANCE' + Math.random())
    this.goLoop(ctx);
  }

  @Action(/^NextStep(.+)$/)
  async NextStep(@Ctx() ctx) {
    console.debug('ACTION');
    await ctx.answerCbQuery();
    const user = ctx.update.callback_query.from;

    const pollId = ctx.match[1];
    console.debug(pollId);
    if (this.lastPublishedPollId === undefined) {
      return;
    }

    const isUserAlreadyVoted = await this.userService.isUserAlreadyVoted(user.username, pollId);
    console.debug(isUserAlreadyVoted);
    if (isUserAlreadyVoted['cnt']) {
      return;
    }

    await this.userService.insertOrIgnorePollChoice(user.username, user.first_name, this.lastPublishedPollId);
    await this.refreshPollView(ctx.update.callback_query.message.chat.id);
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Scenes.SceneContext) {
    //console.log('location scene left');
    //await ctx.deleteMessage();
  }

  private prepareButtons() {
    const buttons = [];
    buttons.push([Markup.button.callback('Играю!', 'NextStep' + this.lastPublishedPollId)]);

    return buttons;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeSleep() {
    await this.sleep(1000 * 5);
  }

  private async goLoop(ctx) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    while (true) {
      await this.makeSleep();

      const dayOfWeekDigit = new Date().getDay();
      const currentHours = new Date().getHours();
      //console.debug(dayOfWeekDigit, currentHours);
      if (dayOfWeekDigit != 1) {
        continue;
      }

      if (currentHours < 9 || currentHours > 15) {
        //continue;
      }

      const totalPolls = await this.pollService.isAlreadyPublished();
      console.debug(totalPolls);
      if (parseInt(totalPolls.cnt) > 0) {
        continue;
      }

      this.lastPublishedPollId = await this.preparePoll();
      const pollMessage = await this.showPoll(ctx.update.message.chat.id);
      this.lastPublishedPollMessageId = pollMessage.message_id;
      await this.pollService.setMessageId(this.lastPublishedPollMessageId, this.lastPublishedPollId);
    }
  }

  async showPoll(chatId: number) {
    const buttons = this.prepareButtons();

    return await this.bot.telegram.sendMessage(chatId,`Кто готов играть в среду с 18:00 до 20:00? Максимум 6 человек.

Кто 7-й, 8-й и т.д - Вы попали в резерв в порядке очереди. Если кто-то из отметившихся раньше не сможет прийти, то этот человек вас лично оповестит и вы сможете заменить его.

Чтобы начать взаимодействие с ботом, вначале нажмите /start, а затем голосуйте. 
`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons),
    });
  }

  private async preparePoll(): Promise<any> {
    return this.pollService.insertOrIgnorePoll();
  }

  private async refreshPollView(chatId: number ) {
    const players = await this.userService.getPlayers(this.lastPublishedPollId);
    console.debug(players);
    let playerNames = '';
    let index = 0;
    players.forEach((userLogin) => {
      index++;
      playerNames += index + '. @' + userLogin.user_login + ' (' + userLogin.user_name + ') ' +  userLogin.applied_at + ' \n';
    });
    const buttons = this.prepareButtons();
    await this.bot.telegram.editMessageText(chatId, this.lastPublishedPollMessageId, null, `Кто готов играть в среду с 18:00 до 20:00? Максимум 6 человек.

Кто 7-й, 8-й и т.д - Вы попали в резерв в порядке очереди. Если кто-то из отметившихся раньше не сможет прийти, то этот человек вас лично оповестит и вы сможете заменить его.

Чтобы начать взаимодействие с ботом, вначале нажмите /start, а затем голосуйте. 

Проголосовали в порядке очереди:
` + playerNames, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons),
    })
  }
}
