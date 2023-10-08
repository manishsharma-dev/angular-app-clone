import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HistoryDetail } from './ai-model/ai-details.model';
import { OwnerDetails } from './ai-model/owner-detail.model';

@Injectable({
  providedIn: 'root'
})
export class ArtificialInseminationService {
  apiUrl : string =  environment.apiURL
  getBullId:string = this.apiUrl + 'animalbreeding/AI/getBullDetailsAndAiType?'
  getHistory:string = this.apiUrl + 'animalbreeding/history/getBreedingHistory?tagId='
  constructor(private http: HttpClient) {}
  
   // Add new AI
    registerNewAI(aiDetails: any) {
      return this.http.post(this.apiUrl + 'animalbreeding/AI/saveAIDetails', aiDetails);
    }

    // Get Bull Id Suggestion 

    getBullIdSuggestion(bull_detail :object) {
//       let headers = new HttpHeaders()
//,{observe: 'response'}
// headers=headers.append('content-type','application/text')
// headers=headers.append('Access-Control-Allow-Origin', '*')
// headers=headers.append('content-type','application/x-www-form-urlencoded')
      return this.http.get<any>(`${this.getBullId}bullId=${bull_detail['bullId']}&elite=${bull_detail['isElite']}&villageCd=${bull_detail['villageCd']}&aiDate=${bull_detail['aiDate']}&tagId=${bull_detail['tagId']}`)
    }

    getAnimalHistory(tagId: string) {
      return this.http.get<HistoryDetail[]>(this.getHistory+ tagId).pipe(
        map((res) => {
          return res;
        })
      );
    }
  
     // Common Master APIs
     getCommonMaster(key: string) {
      return this.http.post(environment.apiURL + 'commonutility/getCommonMaster', {
        key,
      });
    }
    
    validateBatchNo(batch:number,bullid:string){
      return this.http.get(`${this.apiUrl}animalbreeding/AI/getStrawDetails?batchNo=${batch}&bullId=${bullid}`);
    }

    updateAnimalDetails(params:any){
      return this.http.post(this.apiUrl + 'animalbreeding/search/updateAnimalAdditionalDetails', params);
    }
    getAICenterDetail(userId:string){
      return this.http.post(`${this.apiUrl}admin/user/getUserDetails?userId=${userId}`,{});

    }
    getUniqueIdDetail(uniqueId:string){
      return this.http.get(`${this.apiUrl}animalbreeding/AI/getDetailsForUniqueStraw?uniqueStrawId=${uniqueId}`);

    }
    getAIDetailsByID(tag_id:number){
      return this.http.get(`${this.apiUrl}animalbreeding/AI/getLatestAIDetails?tagId=${tag_id}`);

    }
    udateAIDetails(aiDetails:any){
      return this.http.put(this.apiUrl + 'animalbreeding/AI/updateAIDetails', aiDetails);
    }
    validateAiHeatNumber(tag_id:number,ai_date:string){
      return this.http.get(`${this.apiUrl}animalbreeding/AI/validateAiHeatNo?tagId=${tag_id}&aiDate=${ai_date}`);

    }
}
