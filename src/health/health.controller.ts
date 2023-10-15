import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
// import { PostgresHealthIndicator } from './postgres.health.indicator';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    // private pg: PostgresHealthIndicator,
  ) {}

  @Get(['*'])
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      // () => this.pg.isHealthy(),
    ]);
  }
}
