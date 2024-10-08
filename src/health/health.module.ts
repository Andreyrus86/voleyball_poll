import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { HealthController } from './health.controller';
// import { PostgresHealthIndicator } from './postgres.health.indicator';
// import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    //DatabaseModule,
  ],
  controllers: [HealthController],
  providers: [
    // PostgresHealthIndicator
  ],
})
export class HealthModule {}
