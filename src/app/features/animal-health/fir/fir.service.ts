import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FirListForUser } from './models/firListForUser.model';
import { MergeIntimationReport } from './models/firstIncDetails.model';
import { ProbableSource } from './models/probableSource.model';
import { SaveFIR } from './models/saveFIR.model';
import { MasterSpecies, Species } from './models/species.model';

const BACKEND_URL = environment.apiURL + 'animalhealthdiseasereporting';
const COMMON_URL =   environment.apiURL ;


@Injectable({
  providedIn: 'root',
})
export class FIRService {
  constructor(private httpClient: HttpClient) {}

  public getMergeIntimationReport(firstInc:MergeIntimationReport){
    return this.httpClient.post<any>(BACKEND_URL + '/intimationreport/mergeIntimationReport', firstInc)
  }

  public getCountofAffectedSpecies(data){
    return this.httpClient.post<Species[]>(BACKEND_URL + '/intimationreport/getCountofAffectedSpecies', data)
  }

  public getprobableSource(key:string){
    return this.httpClient.post<ProbableSource[]>(COMMON_URL + 'commonutility/getCommonMaster', {key})
  }

  public getSpecies(key:string){
    return this.httpClient.post<MasterSpecies[]>(COMMON_URL + 'commonutility/getCommonMaster', {key})
  }
  public getFirListForUser(){
    return this.httpClient.post<FirListForUser[]>(BACKEND_URL + '/getFirListForUser', {})
  }

  public getActionTakenList(){
    return this.httpClient.get<any>(BACKEND_URL + '/getActionTakenList')
  }

  public getAffectedAnimals(data){
    return this.httpClient.post<Species[]>(BACKEND_URL + '/getAffectedAnimals', data)
  }
  public saveFIR(data){
    return this.httpClient.post<SaveFIR[]>(BACKEND_URL + '/saveFirstIncidenceReport', data)
  }
}
