import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MilkSampleDetails } from './models/sample-details.model';
import { SaveSampleReq } from './models/save-sample-req.model';
import { UpdateSampleReq } from './models/update-sample-req.model';

@Injectable({
  providedIn: 'root',
})
export class MilkSamplingService {
  private readonly apiUrl = environment.apiURL + 'animalperformance/sample';

  constructor(private http: HttpClient) {}

  saveOnSpotTesting(req: SaveSampleReq) {
    return this.http.post<SaveSampleReq>(
      this.apiUrl + '/saveOnSpotTesting',
      req
    );
  }

  saveSampleTesting(req: SaveSampleReq) {
    return this.http.post<SaveSampleReq>(
      this.apiUrl + '/saveSampleTesting',
      req
    );
  }

  getMilkSampleDetails(sampleIds: string[]) {
    const sampleId = sampleIds.map((id) => id.toLocaleUpperCase());
    return this.http.post<MilkSampleDetails[]>(
      this.apiUrl + '/getMilkSampleDetails',
      {
        sampleId,
      }
    );
  }

  updateSamples(req: UpdateSampleReq) {
    return this.http.put<any>(this.apiUrl + '/updateMSDetails', req);
  }
}
