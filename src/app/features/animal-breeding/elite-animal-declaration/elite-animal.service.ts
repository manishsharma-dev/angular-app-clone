import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OwnerDetails } from '../../animal-health/models/animal.model';

@Injectable({
  providedIn: 'root',
})
export class EliteAnimalService {
  private readonly apiUrl = environment.apiURL + 'animalbreeding/';

  constructor(private http: HttpClient) {}

  searchOwnerDetails(searchValue: string) {
    return this.http
      .get<OwnerDetails[]>(
        `${this.apiUrl}search/getSearchDetails?searchCriteria=${searchValue}`
      )
      .pipe();
  }

  saveEliteDeclarationDetails(req: any) {
    return this.http.post<any>(
      this.apiUrl + 'elite/saveEliteDeclarationDetails',
      req
    );
  }

  getWords(monthCount: any) {
    function getPlural(number: any, word: any) {
      return (number === 1 && word.one) || word.other;
    }

    var months = { one: 'M', other: 'M' },
      years = { one: 'Y', other: 'Y' },
      m = monthCount % 12,
      y = Math.floor(monthCount / 12),
      result = [];

    y && result.push(y + '' + getPlural(y, years));
    m && result.push(m + '' + getPlural(m, months));
    return result.join(' ');
  }
}
