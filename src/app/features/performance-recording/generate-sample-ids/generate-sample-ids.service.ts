import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SampleID } from './models/sample-id.model';

@Injectable({
  providedIn: 'root',
})
export class GenerateSampleIdsService {
  private readonly apiURL = environment.apiURL + 'animalperformance/';

  constructor(private http: HttpClient) {}

  generateSampleId(req: any) {
    return this.http.post<SampleID[]>(this.apiURL + 'generateSampleId', req);
  }

  getPreviousSampleIds(req) {
    return this.http.post<SampleID[]>(
      this.apiURL + 'getPreviousSampleIds',
      req
    );
  }

  exportExcel(req: {
    projectId: string;
    sampleId: string[];
    sampleIdStatus: string[];
    isHistory?: boolean;
    modifiedBy?: string;
  }) {
    req.isHistory = req.isHistory ?? false;

    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.http.post<any>(
      this.apiURL + 'exportExcel',
      req,
      // {
      //   projectId,
      //   sampleId,
      //   sampleIdStatus,
      //   isHistory,
      //   modifiedBy,
      // },
      requestOptions
    );
  }
}
