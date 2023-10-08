import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SaveUntagged } from './models/SaveUntagged.model';
import { NoTagging } from './models/noTagging.model';
import { UntaggedTransaction } from './models/untagged-transaction.model';

const BACKEND_URL = environment.apiURL;
const COMMON_URL = environment.apiURL;
@Injectable({
  providedIn: 'root',
})
export class UntaggedAnimalService {
  constructor(private httpClient: HttpClient) {}

  public saveUntaggedAnimal(request: SaveUntagged) {
    return this.httpClient.post<[SaveUntagged]>(
      BACKEND_URL + 'animalhealthtreatment/saveUntaggedAnimalTreatment',
      request
    );
  }

  public getnoTagging(key: string) {
    return this.httpClient.post<NoTagging[]>(
      COMMON_URL + 'commonutility/getCommonMaster',
      { key }
    );
  }
  downloadUntaggedReport(transactionId: number) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.httpClient.post(
      BACKEND_URL + 'animalhealthtreatment/viewDownloadUntaggedAnimalTreatment',
      {
        transactionId,
      },
      requestOptions
    );
  }

  getUntaggedAnimalTreatmentDetails() {
    return this.httpClient.get<UntaggedTransaction[]>(
      BACKEND_URL + 'animalhealthtreatment/getUntaggedAnimalTreatmentDetails'
    );
  }
}
