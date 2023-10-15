import { Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Pool } from 'pg';

@Injectable()
export class PostgresHealthIndicator extends HealthIndicator {
  constructor(@Inject('DATABASE_POOL') private connectionPool: Pool) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const client = await this.connectionPool.connect();
    try {
      const result = await client.query('select 1 as success');
      client.release();

      return this.getStatus('pg', true, { result: result.rows[0] });
    } catch (e) {
      client.release();
      return this.getStatus('pg', false, { message: e.message });
    }
  }

  async sendCommand() {}
}
