import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DryOffService {
  private readonly apiUrl = environment.apiURL + 'animalperformance/dryOff/';

  constructor(private http: HttpClient) {}

  saveDryOff(req: any) {
    return this.http.post<any>(this.apiUrl + 'saveDryOff', req);
  }

  updateDryOffDetails(req: any) {
    return this.http.put<any>(this.apiUrl + 'updateDryOffDetails', req);
  }

  deleteDryOffDetails(req: any) {
    return this.http.put(this.apiUrl + 'deleteDryOffDetails', req);
  }

  editDryOff(req: any) {
    return this.http.put(this.apiUrl + 'updateDryOffDetails', req);
  }

  getAnimalsEligibleForDryOff(projectId: string) {
    return this.http.get(this.apiUrl + 'getAnimalsEligibleForDryOff', {
      params: { projectId },
    });
  }
}
