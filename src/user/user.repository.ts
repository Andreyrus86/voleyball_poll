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
                        INSERT INTO polls (created_at) VALUES (CURRENT_DATE) RETURNING id;
                    `,
          )
          .then((res) => {
            client.release();

            return res.rows[0]['id'];
          })
          .catch((err) => {
            client.release();
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
            //console.debug(err.stack, telegramMessageId, pollId);
            throw new CommonException(`Ошибка при редактировании опроса`, 500);
          });
    });
  }

  insertOrIgnorePollChoice(
    userLogin: string,
    userName: string,
    pollId: number,
  ): Promise<any> {
    return this.connectionPool.connect().then((client) => {
      return client
        .query(
          `
                        INSERT INTO poll_answers (poll_id, user_login, user_name, applied_at)               
                        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                        ON CONFLICT (poll_id, user_login) DO NOTHING
                    `,
          [pollId, userLogin, userName],
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
                        WHERE DATE(p.created_at) >= CURRENT_DATE - 2
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

    getPlayers(pollId: number) {
        return this.connectionPool.connect().then((client) => {
            return client
                .query(
                    `
                        SELECT user_login, user_name,
                               TO_CHAR(applied_at, 'YYYY-MM-DD HH:MI:SS') as applied_at
                        FROM poll_answers                 
                        WHERE poll_id = $1
                        ORDER BY applied_at ASC
                    `,
                    [pollId]
                )
                .then((res) => {
                    client.release();

                    return res.rows;
                })
                .catch((err) => {
                    client.release();

                    return undefined;
                });
        });
    }

    isUserAlreadyVoted(userLogin: string, pollId: number) {
        return this.connectionPool.connect().then((client) => {
            return client
                .query(
                    `
                        SELECT count(*) > 0 as cnt 
                        FROM poll_answers                  
                        WHERE user_login = $1 AND poll_id = $2
                    `,
                    [userLogin, pollId]
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
