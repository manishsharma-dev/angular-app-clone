import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ExaminationSubType } from './models/examination-sub-type.model';
import { SaveGeneticRes } from './models/save-genetic-res.model';

@Injectable({
  providedIn: 'root',
})
export class GeneticAnalysisService {
  private readonly apiURL = environment.apiURL + 'animalperformance';
  // private readonly testapi = environment.testApiURL + 'animalperformance';

  constructor(private http: HttpClient) {}

  saveGeneticAnalysis(req: any) {
    return this.http.post<SaveGeneticRes[]>(
      this.apiURL + '/saveGeneticAnalysis',
      req
    );
  }

  getExaminationSubtype(breedingExaminationType: number) {
    return this.http.get<ExaminationSubType[]>(
      this.apiURL + '/getExaminationSubtype',
      {
        params: {
          breedingExaminationType,
        },
      }
    );
  }
}
