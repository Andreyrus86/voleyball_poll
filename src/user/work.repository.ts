import { Update } from 'nestjs-telegraf';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Update()
@Injectable()
export class WorkRepository {
  constructor(@Inject('DATABASE_POOL') private connectionPool: Pool) {}

  getAll(): Promise<any> {
    return this.connectionPool.connect().then((client) => {
      return client
        .query(`SELECT * FROM work;`)
        .then((res) => {
          client.release();

          return res.rows;
        })
        .catch((err) => {
          client.release();
          //console.log(err.stack)
          return [];
        });
    });
  }

  getWorkPositionsForUser(userId: number): Promise<any> {
    return this.connectionPool.connect().then((client) => {
      return client
        .query(
          `
                        WITH user_work AS (
                            SELECT w.id, w.code FROM work as w WHERE w.code IN
                            (SELECT UNNEST(us.work) FROM users AS u 
                            INNER JOIN user_settings AS us ON u.id = us.user_id                            
                            WHERE u.telegram_id = $1)
                        )                        
                        SELECT wp.* FROM work_positions AS wp
                        INNER JOIN user_work AS uw ON uw.id = wp.work_id                                                
                    `,
          [userId],
        )
        .then((res) => {
          client.release();

          return res.rows;
        })
        .catch((err) => {
          client.release();
          console.log(err.stack);
          return [];
        });
    });
  }
}
