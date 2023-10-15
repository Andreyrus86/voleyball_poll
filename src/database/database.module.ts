import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { ModuleRef } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        console.log('here here here');
        return new Pool({
          user: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          host: configService.get('DB_HOST'),
          database: configService.get('DB_NAME'),
          port: configService.get('DB_PORT'),
        });
      },
    },
    DatabaseService,
  ],
  exports: [DatabaseService, 'DATABASE_POOL'],
})
export class DatabaseModule {
  constructor(private readonly moduleRef: ModuleRef) {}

  onApplicationShutdown(signal?: string): any {
    //this.logger.log(`Shutting down on signal ${signal}`);
    const pool = this.moduleRef.get('DATABASE_POOL') as Pool;
    return pool.end();
  }
}
