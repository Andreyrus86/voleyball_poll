import { Update } from 'nestjs-telegraf';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CommonException } from '../exceptions/common.exception';

@Update()
@Injectable()
export class UserRepository {
  constructor(@Inject('DATABASE_POOL') private connectionPool: Pool) {}

  insertOrIgnorePoll(
  ): Promise<any> {
    return this.connectionPool.connect().then((client) => {
      return client
          .query(
              `
                        INSERT INTO polls RETURNING id;
                    `,
          )
          .then((res) => {
            client.release();

            return res;
          })
          .catch((err) => {
            client.release();
            //console.log(err.stack)
            throw new CommonException(`Ошибка при сохранении опроса`, 500);
          });
    });
  }

  setMessageId(
      telegramMessageId: number,
      pollId: number,
  ): Promise<any> {
    return this.connectionPool.connect().then((client) => {
      return client
          .query(
              `
                        UPDATE polls SET telegram_message_id = $1
                        WHERE id = $2
                    `,
              [telegramMessageId, pollId]
          )
          .then((res) => {
            client.release();
            //console.log(res.rows[0])
          })
          .catch((err) => {
            client.release();
            //console.log(err.stack)
            throw new CommonException(`Ошибка при сохранении опроса`, 500);
          });
    });
  }

  insertOrIgnorePollChoice(
    userLogin: string,
    pollId: number,
  ): Promise<any> {
    return this.connectionPool.connect().then((client) => {
      return client
        .query(
          `
                        INSERT INTO poll_answers (poll_id, user_login)                 
                        ON CONFLICT (poll_id, user_login) DO NOTHING
                    `,
          [userLogin, pollId],
        )
        .then((res) => {
          client.release();
          //console.log(res.rows[0])
        })
        .catch((err) => {
          client.release();
          //console.log(err.stack)
          throw new CommonException(`Ошибка при сохранении ответа пользователя`, 500);
        });
    });
  }

  isAlreadyPublished() {
      return this.connectionPool.connect().then((client) => {
        return client
            .query(
                `
                        SELECT count(p.*) as cnt 
                        FROM polls AS p                    
                        WHERE DATE(p.created_at) = CURRENT_DATE
                    `,
            )
            .then((res) => {
              client.release();

              return res.rows[0];
            })
            .catch((err) => {
              client.release();

              return undefined;
            });
      });
  }
}
