import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RoundList } from './models/roundList.model';
import { SaveRoundMaster } from './models/saveRoundMaster.model';
import { EditRoundMaster } from './models/editRound.model';


const BACKEND_URL = environment.apiURL + 'animalhealth' ;
const COMMON_URL = environment.apiURL ;

@Injectable({
  providedIn: 'root'
})
export class RoundMasterService {

  constructor(private httpClient: HttpClient) { }

  public roundList(request: any){
    return this.httpClient.get<any>(BACKEND_URL + '/getAllVaccinationRoundMaster',request)
  }
  public saveRoundMaster(request: SaveRoundMaster){
    return this.httpClient.post<SaveRoundMaster[]>(BACKEND_URL + '/saveVaccinationRoundMaster',request)
  }

  viewRoundService(roundNo: number, stateCd: number,diseaseCd:number) {
    return this.httpClient.post<any>(BACKEND_URL + '/viewVaccinationRoundMaster',
      {
        roundNo,
        stateCd,
        diseaseCd
      }
    );
  }

  public editRound( editRound: EditRoundMaster){
    return this.httpClient.post<any>(BACKEND_URL + '/updateVaccinationRoundMaster', editRound)
  }
}