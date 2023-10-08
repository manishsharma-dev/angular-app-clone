import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetGeoTransactionSummary } from './models/getGeoTransaction.model';



const COMMON_URL = environment.apiURL;

@Injectable({
  providedIn: 'root'
})
export class UserActivityReportService {

  constructor(private httpClient: HttpClient) { }

  public getGeoTransactionSummary(request) {
    return this.httpClient.post<GetGeoTransactionSummary[]>(COMMON_URL + 'commonutility/report/getGeoTransactionSummary', request)
  }

  public getGeoTransactionDetails(request) {
    return this.httpClient.post<GetGeoTransactionSummary[]>(COMMON_URL + 'commonutility/report/getGeoTransactionDetailList', request)
  }

  downloadGeoTransactionDetailList(data) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.httpClient.post(
      COMMON_URL + 'commonutility/report/downloadGeoTransactionDetailList', data, requestOptions);
  }


  downloadGeoTransactionSummary(data) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.httpClient.post(
      COMMON_URL + 'commonutility/report/downloadGeoTransactionSummary', data, requestOptions);
  }


}
