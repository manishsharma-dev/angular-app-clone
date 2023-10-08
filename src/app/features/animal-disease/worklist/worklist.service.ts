import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ViewActionForm } from './models/viewActionForm.model';

const BACKEND_URL = environment.apiURL + 'animalhealthdiseasereporting';
const COMMON_URL =   environment.apiURL ;


@Injectable({
  providedIn: 'root',
})
export class WorkListService {
  constructor(private httpClient: HttpClient) {}

  public viewActionForm(firId:number){
    const  data = {
      firId : firId
     }
    return this.httpClient.post<any>(BACKEND_URL + '/viewFirstIncidenceReport', data)
  }

   getPreviousTestResults(req: { firId: number }) {
    return this.httpClient.post<any>(BACKEND_URL + '/viewFirstIncidenceReport', req)
  }
  public rejectFir(totalFirId:any){
    const  data = {
      firId : totalFirId
     }
    return this.httpClient.put<any>(BACKEND_URL + '/rejectFir', data)
  }
  public approveFir(data){
    return this.httpClient.post<any>(BACKEND_URL + '/approveFir', data)
  }
}
