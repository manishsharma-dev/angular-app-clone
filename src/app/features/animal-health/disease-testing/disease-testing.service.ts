import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalData } from '../animal-treatment/animal-treatment.component';

@Injectable({
  providedIn: 'root',
})
export class DiseaseTestingService {
  constructor(private http: HttpClient) { }
  private readonly apiUrlAnimalHealth =
    environment.apiURL + 'animalhealthtestingsamples';
  getAnimalList(page: number) {
    return of(ELEMENT_DATA2).pipe(
      delay(0),
      map((value) => {
        const data = value.slice(page, page + 10);
        return {
          data,
          count: value.length,
        };
      })
    );
  }

  getAnimal(tagID: number) {
    return of(ELEMENT_DATA2).pipe(
      map((value) => value.find((animal) => animal.tagId === tagID))
    );
  }

  //Disease Testing
  submitDiseaseTesting(req: any) {
    return this.http.post(`${this.apiUrlAnimalHealth}/saveDiseaseTesting`, req)
  }

  getPreviousTestResults(req: { tagId: string }) {
    return this.http.post(`${this.apiUrlAnimalHealth}/getPreviousTestResults`, req)
  }

  //Group disease Testing

  submitGroupDiseaseTesting(req: any) {
    return this.http.post(`${this.apiUrlAnimalHealth}/saveGroupDiseaseTesting`, req)
  }
}

const ELEMENT_DATA2: AnimalData[] = [
  {
    tagId: 234567893240,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893241,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893242,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893243,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893244,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893245,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893246,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893247,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893248,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893249,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893250,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893251,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893252,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893253,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893254,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893255,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893256,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893257,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893258,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893259,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
  {
    tagId: 234567893260,
    species: 'Buffalo',
    sex: 'F',
    ageInMonths: '7Y 7M',
    pregnancyStatus: 'Yes',
    milkingStatus: 'Yes',
    breed: 'Murrah',
  },
  {
    tagId: 234567893261,
    species: 'Cow',
    sex: 'F',
    ageInMonths: '5Y 7M',
    pregnancyStatus: 'No',
    milkingStatus: 'No',
    breed: 'Murrah',
  },
];
