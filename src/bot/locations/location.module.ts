import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { LocationService } from './location.service';
import { Client } from './client';

const clientFactory = async (configService: ConfigService) => {
  return new Client(
    configService.get('REMOTE_SERVICE_HOST'),
    configService.get('SERVICE_API_KEY'),
  );
};

@Module({
  imports: [DatabaseModule],
  providers: [
    LocationService,
    {
      provide: 'LOCATIONS_CLIENT',
      inject: [ConfigService],
      useFactory: clientFactory,
    },
  ],
  exports: [LocationService, 'LOCATIONS_CLIENT'],
})
export class LocationModule {}
