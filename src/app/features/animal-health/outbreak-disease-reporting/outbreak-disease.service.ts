import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetActiveOutBreakList } from './models/getActiveOutbreakDetails.model';
import { OutBreakDetails } from './models/getOutbreakDetail.model';
import { SeverityOfOutBreak } from './models/severityOfOutbreak.model';

const BACKEND_URL = environment.apiURL + 'animalhealthdiseasereporting';
const COMMON_URL =   environment.apiURL ;

@Injectable({
  providedIn: 'root'
})
export class OutBreakDiseaseService {

  constructor(private httpClient: HttpClient) { }

  getActiveOutbreak() {
    return this.httpClient.post<GetActiveOutBreakList[]>(BACKEND_URL + '/getAllOutbreakDetails', {
    });
  }

  getOutbreakDetail(paramData) {
    return this.httpClient.post<OutBreakDetails[]>(BACKEND_URL + '/getOutbreakDetail', paramData);
  }
  public severityOfOutbreak(key:string){
    return this.httpClient.post<SeverityOfOutBreak[]>(COMMON_URL + 'commonutility/getCommonMaster', {key})
  }

  public saveOutBreak(data){
    return this.httpClient.post<[]>(BACKEND_URL + '/saveFollowUpOutbreak', data)
  }


  downloadFinalOutBreakReport(outbreakId: number) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.httpClient.post(
      BACKEND_URL + '/downloadFinalIntimationReport',
      {
        outbreakId,
        
      },
      requestOptions
    );
  }

  downloadInterimReport(outbreakId: number,interimReportNo:number) {
    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };
    return this.httpClient.post(
      BACKEND_URL + '/downloadIntimationReport',
      {
        outbreakId,
        interimReportNo
        
      },
      requestOptions
    );
  }
  

}
