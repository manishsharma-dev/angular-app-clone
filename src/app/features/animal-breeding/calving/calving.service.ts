import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HistoryDetail } from './model/calving-detail.model';

@Injectable({
  providedIn: 'root'
})
export class CalvingService {
  apiUrl : string = environment.apiURL
  saveDetail: string = this.apiUrl + 'animalbreeding/calving/saveCalvingDetails'
  updateDetail: string =   this.apiUrl + 'animalbreeding/calving/updateCalvingDetails'


  constructor(private http: HttpClient) {}

    // Common Master APIs
    getCommonMaster(key: string) {
      return this.http.post(environment.apiURL + 'commonutility/getCommonMaster', {
        key,
      });
    }

      // Add new Calving
      registerNewCalving(carvingDetails: any) {
        let headers = {'enctype': 'multipart/form-data'};
        return this.http.post(this.saveDetail, carvingDetails , {headers:headers});
      }
      getAnimalHistory(tagId: string) {
        return this.http.get<HistoryDetail[]>(`${this.apiUrl}animalbreeding/history/getBreedingHistory?tagId=${tagId}`).pipe(
          map((res) => {
            return res;
          })
        );
      }
      getServiceType(param: any){
        return this.http.get(`${this.apiUrl}animalbreeding/search/getServiceTypes?currentLactationNo=${param.currentLactationNo}&tagId=${param.tagId}&transactionDate=${param?.transactionDate}`);
      }
      validateEarTagId(tagId:number){
        return this.http.post(`${this.apiUrl}animalbreeding/search/checkEarTagAvailable?tagId=${tagId}`,{});
      }
      validateBullID(searchValue:any){
        return this.http.get<any>(
          `${this.apiUrl}animalbreeding/bullMaster/validateBullId`,
          { params: { ...searchValue } }
        );
      }
      validateSireId(searchValue:any){
         return this.http.post(`${this.apiUrl}animalbreeding/search/checkEarTagIsMale?tagId=${searchValue?.tagId}&cattleId=${searchValue?.cattleId}`,{});
      }
      getCalvingDetailsByID(tag_id:number){
        return this.http.get(`${this.apiUrl}animalbreeding/calving/getLatestCalvingDetails?tagId=${tag_id}`);
  
      }
      updateCalvingDetails(carvingDetails: any) {
        let headers = {'enctype': 'multipart/form-data'};
        return this.http.put(this.updateDetail, carvingDetails , {headers:headers});
      }
      getGestationDays(tagId:number,calvingDate:string){
        return this.http.post(`${this.apiUrl}animalbreeding/calving/getGestationDays?tagId=${tagId}&calvingDate=${calvingDate}`,{});
      }
}
