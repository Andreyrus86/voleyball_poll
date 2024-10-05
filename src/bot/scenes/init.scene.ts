import {Action, Ctx, InjectBot, Scene, SceneEnter, SceneLeave, Sender,} from 'nestjs-telegraf';
import {Markup, Scenes, Telegraf} from 'telegraf';
import {UserService} from '../../user/user.service';
import {PollService} from "../../polls/poll.service";

@Scene(InitScene.SCENE_ID)
export class InitScene {
  public static readonly SCENE_ID = 'INIT_TYPE_SCENE_ID';
  //public static CHANNEL_ID = -4028704815;
  public static CHANNEL_ID = -1001936026117;
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
    let username = user.username;
    if (user.username === undefined || user.username === null) {
      username = user.first_name
    }
    const isUserAlreadyVoted = await this.userService.isUserAlreadyVoted(username, pollId);
    console.debug(isUserAlreadyVoted);
    if (isUserAlreadyVoted['cnt']) {
      return;
    }

    await this.userService.insertOrIgnorePollChoice(username, user.first_name, pollId);
    let poll = await this.userService.getPoll(pollId);
    console.debug(poll);
    await this.refreshPollView(ctx.update.callback_query.message.chat.id, pollId, poll[0]['telegram_message_id']);
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Scenes.SceneContext) {
    //console.log('location scene left');
    //await ctx.deleteMessage();
  }

  private prepareButtons(pollId: number) {
    return [];

    const buttons = [];
    buttons.push([Markup.button.callback('Играю!', 'NextStep' + pollId)]);

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
      await this.makeVote(ctx);

      return;
    }
    this.initialized = true;

    const hour = randomNumber(10, 10);
    const minutes = randomNumber(15, 15);

    while (true) {
      await this.makeSleep();

      const dayOfWeekDigit = new Date().getDay();
      const currentHours = new Date().getHours();
      const currentMinutes = new Date().getMinutes();
      console.debug(dayOfWeekDigit, currentHours, currentMinutes, "VOTE STARTS", hour, minutes);

      if (dayOfWeekDigit != 2 && dayOfWeekDigit != 4) {
        continue;
      }

      if (currentHours < hour) {
        continue;
      }

      if (currentMinutes < minutes) {
        continue;
      }

      const totalPolls = await this.pollService.isAlreadyPublished();
      console.debug(totalPolls);
      if (parseInt(totalPolls.cnt) > 0) {
        continue;
      }

      let pollId = await this.preparePoll();
      const pollMessage = await this.showPoll(ctx.update.message.chat.id, pollId);
      this.lastPublishedPollMessageId = pollMessage.message_id;
      await this.pollService.setMessageId(this.lastPublishedPollMessageId, pollId);
    }
  }

  async showPoll(chatId: number, pollId: number) {
    const buttons = this.prepareButtons(pollId);

    return await this.bot.telegram.sendMessage(chatId,`${this.getPollMainMessage()}
`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons),
    });
  }

  private getPollMainMessage() {
    return `Кто готов играть в пятницу с 19:30 до 21:30? Максимум 6 человек. Или 8+ - на 2 площадки.

Кто 7-й - Вы попали в резерв в порядке очереди. Если кто-то из отметившихся раньше не сможет прийти, то этот человек вас лично оповестит и вы сможете заменить его.

Чтобы проголосовать нажмите /start`;
  }

/*  private getPollMainMessage() {
    return `Кто готов играть в субботу с 09:00 до 11:00? Количество человек меньше 6 (включительно) или больше 8 (включительно)

Кто последний 7-й - Вы попали в резерв в порядке очереди. Если кто-то из отметившихся раньше не сможет прийти, то этот человек вас лично оповестит и вы сможете заменить его.

Чтобы проголосовать нажмите /start`;
  }*/

  private async preparePoll(): Promise<any> {
    return this.pollService.insertOrIgnorePoll();
  }

  private async refreshPollView(chatId: number, pollId: number, messageId: number) {
    const players = await this.userService.getPlayers(pollId);
    console.debug(players);
    let playerNames = '';
    let index = 0;
    players.forEach((userLogin) => {
      index++;
      playerNames += index + '. @' + userLogin.user_login + ' (' + userLogin.user_name + ') ' +  userLogin.applied_at + ' \n';
    });
    const buttons = this.prepareButtons(pollId);
    await this.bot.telegram.editMessageText(chatId, messageId, null, this.getPollMainMessage() + `
    
Проголосовали в порядке очереди:
` + playerNames, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons),
    })
  }

  private async makeVote(ctx) {
    let lastPoll = await this.userService.getLastPoll();
    const user = ctx.update.message.from;
    const pollId = lastPoll['id'];
    let username = user.username;
    if (user.username === undefined || user.username === null) {
      username = user.first_name
    }
    const isUserAlreadyVoted = await this.userService.isUserAlreadyVoted(username, pollId);
    console.debug(isUserAlreadyVoted);
    if (isUserAlreadyVoted['cnt']) {
      return;
    }

    await this.userService.insertOrIgnorePollChoice(username, user.first_name, pollId);
    let poll = await this.userService.getPoll(pollId);
    console.debug(poll);
    await this.refreshPollView(ctx.update.message.chat.id, pollId, poll[0]['telegram_message_id']);
  }
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
