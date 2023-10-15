import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { query } from 'express';

@Injectable()
export class Client {
  constructor(private host: string, private apiKey: string) {}

  async getGeoZones() {
    const response = await fetch(this.host + '/api/geo.zones', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
    let res = [];
    try {
      res = await response.json();
    } catch (e) {
      res = [];
    }

    return res;
  }

  async getGeo(countryIds: number[]) {
    let query = 'filter=geoCountryId||$in||';
    countryIds.forEach((id) => {
      query += id + ',';
    });
    query = query.replace(/^,+|,+$/g, '');
    const response = await fetch(
      this.host + '/api/geo?' + query,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      },
    );
    let res = [];
    try {
      res = await response.json();
    } catch (e) {
      res = [];
    }

    return res;
  }

  async getCountries() {
    const response = await fetch(this.host + '/api/geo.countries', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
    let res = [];
    try {
      res = await response.json();
    } catch (e) {
      res = [];
    }

    return res;
  }
}
