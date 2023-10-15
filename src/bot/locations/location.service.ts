import { Update } from 'nestjs-telegraf';
import { Inject, Injectable } from '@nestjs/common';
import { Client } from './client';

@Update()
@Injectable()
export class LocationService {
  constructor(@Inject('LOCATIONS_CLIENT') private client: Client) {}

  async requestGeoZones() {
    return new Promise(async (resolve, reject) => {
      let result = await this.client.getGeoZones();
      if (result.length) {
        resolve(result);
      } else {
        resolve(false);
      }
    });
  }

  async requestGeoLocations(countryIds: number[]) {
    return new Promise(async (resolve, reject) => {
      let result = await this.client.getGeo(countryIds);
      if (result.length) {
        resolve(result);
      } else {
        resolve([]);
      }
    });
  }

  async requestCountries() {
    return new Promise(async (resolve, reject) => {
      let result = await this.client.getCountries();
      if (result.length) {
        resolve(result);
      } else {
        resolve([]);
      }
    });
  }
}
