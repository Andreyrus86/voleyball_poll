interface Vacancy {
  title: string;
  company: string;
  location: string;
  description: string;
  link: string;
  remote: string;
}

export class VacancyDto implements Vacancy {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  remote: string;
  publishedAt: string;

  /*    constructor(position: string, company: string, location: string, description: string, url: string) {
        this.position = position;
        this.company = company;
        this.description = description;
        this.location = location;
        this.url = url;
    }*/
}
