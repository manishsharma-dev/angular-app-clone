import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonRes } from '../models/common-res.model';
import { PostMortemDetailsRes } from './models/postmortem-details.model';
import { SavePostMortemResponse } from './models/save-postmortem-response.model';
import { LabMaster } from 'src/app/features/animal-health/animal-treatment/models/master.model';
import { SampleDetail } from '../animal-treatment/models/new-case-response.model';
import { GetSampleRes } from './models/get-sample-res.model';

@Injectable({
  providedIn: 'root',
})
export class PostMortemService {
  private readonly apiUrl =
    environment.apiURL + 'animalhealthdiseasereporting/';

  private readonly testingSamplesURL =
    environment.apiURL + 'animalhealthtestingsamples/';

  constructor(private http: HttpClient) {}

  getPostmortemDetail(animalId: number) {
    return this.http.post<PostMortemDetailsRes>(
      this.apiUrl + 'getPostmortemDetail',
      { animalId }
    );
  }

  savePostMortemDetail(requestObj: any) {
    return this.http.post<CommonRes<SavePostMortemResponse>>(
      this.apiUrl + 'savePostmortemDetail',
      requestObj
    );
  }

  updateCauseOfDeathAndPmDiagnosis(
    causeOfDeath: string,
    pmDiagnosis: string,
    postmortemId: number
  ) {
    return this.http.put<boolean>(
      this.apiUrl + 'updateCauseOfDeathAndPmDiagnosis',
      {
        causeOfDeath,
        pmDiagnosis,
        postmortemId,
      }
    );
  }

  downloadPostMortemReport(animalId: number) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.http.post(
      this.apiUrl + 'downloadPostMortemReport',
      {
        animalId,
      },
      requestOptions
    );
  }

  getSampleDetails(sourceOriginId: number) {
    return this.http.post<GetSampleRes>(
      this.testingSamplesURL + 'getSampleDetails',
      {
        sourceOriginId,
        sourceOriginCd: 7,
        followUpNo: 0,
      }
    );
  }
}
