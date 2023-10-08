import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CaseStatus } from './models/caseStatus.model';
import { MinorAilment } from './models/minor-ailment.model';
import { SaveFirstAid } from './models/saveFirstAidDetails.model';
import { ValidateCastration } from './models/validateCastration.model';


const COMMON_URL = environment.apiURL;
const apiUrl = environment.apiURL + 'animalhealthtreatment';
@Injectable({
  providedIn: 'root'
})
export class FirstAidService {

  constructor(private httpClient: HttpClient) { }

  public get_Minor_Ailment(key:string){
    return this.httpClient.post<MinorAilment[]>(COMMON_URL + 'commonutility/getCommonMaster',{key})
  }
  public get_caseStatus(key:string){
    return this.httpClient.post<[CaseStatus]>(COMMON_URL + 'commonutility/getCommonMaster',{key})
  }
  public save_firstAid(firstAid:SaveFirstAid){
    return this.httpClient.post<any>(apiUrl + '/saveFirstAidDetails', firstAid)
  }
  public validateCastration( castration){   
    return this.httpClient.post<ValidateCastration>(apiUrl + '/validateCastration', castration)
  }
}
