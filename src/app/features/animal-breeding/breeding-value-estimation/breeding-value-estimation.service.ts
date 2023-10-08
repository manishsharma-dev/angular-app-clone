import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SaveExcelRes } from './models/save-excel-res.model';
import { CommonRes } from '../../animal-health/models/common-res.model';

@Injectable({
  providedIn: 'root',
})
export class BreedingValueEstimationService {
  private apiURL = environment.apiURL + 'animalbreeding/breedingValue';

  constructor(private http: HttpClient) {}

  saveBreedingValueEstimation(file: File) {
    const fd = new FormData();
    fd.append('file', file);

    return this.http.post<CommonRes<SaveExcelRes>>(
      this.apiURL + '/saveBreedingValueEstimation',
      fd
    );
  }
}
