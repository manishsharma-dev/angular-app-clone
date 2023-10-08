import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HistoryDetail } from './model/pd-detail.model';

@Injectable({
  providedIn: 'root'
})
export class PregnancyDiagnosisService {

  apiUrl:any = environment.apiURL;
  savePdDetail:string = this.apiUrl + 'animalbreeding/pregnancydiagnosis/savePDDetails'
  updatePdDetail:string = this.apiUrl + 'animalbreeding/pregnancydiagnosis/updatePDDetails'
  getHistory:string = this.apiUrl + 'animalbreeding/history/getBreedingHistory?tagId='
  // commonMasterUrl : string = environment.apiURL
  constructor(private http: HttpClient) {}
  
  // Add new AI
    registerNewAI(pdDetails: any) {
      return this.http.post(this.savePdDetail, pdDetails);
    }

     // Common Master APIs
     getCommonMaster(key: string) {
      return this.http.post(environment.apiURL + 'commonutility/getCommonMaster', {
        key,
      });
    }

  getAnimalHistory(tagId: string) {
    return this.http.get<HistoryDetail[]>(`${this.apiUrl}history/getBreedingHistory?tagId=${tagId}`).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getServiceType(param: any){
    return this.http.get(`${this.apiUrl}animalbreeding/search/getServiceTypes?currentLactationNo=${param.currentLactationNo}&tagId=${param.tagId}&transactionDate=${param?.transactionDate}`);
  }
  validateSireId(searchValue:any){
    return this.http.post(`${this.apiUrl}animalbreeding/search/checkEarTagIsMale?tagId=${searchValue?.tagId}&cattleId=${searchValue?.cattleId}`,{});
  }
  validateBullID(searchValue:any){
    return this.http.get<any>(
      `${this.apiUrl}animalbreeding/bullMaster/validateBullId`,
      { params: { ...searchValue } }
    );
  }
  getPDDetailsByID(tag_id:number){
    return this.http.get(`${this.apiUrl}animalbreeding/pregnancydiagnosis/getLatestPDDetails?tagId=${tag_id}`);
  }
  updatePDDetails(pdDetails:any){
    return this.http.put(this.updatePdDetail, pdDetails);
  }
}
