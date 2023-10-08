import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HistoryDetail, OwnerDetails } from '../model/owner.detail';

@Injectable({
  providedIn: 'root'
})
export class OwnerServiceService {

  apiUrl: string = environment.apiURL
  getHistory: string = this.apiUrl + 'animalbreeding/history/getBreedingHistory?tagId='
  constructor(private http: HttpClient) { }

  searchOwnerDetails(searchValue: any,searchType:any,type?:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'type': type
      })
    };
    return this.http.post<OwnerDetails[]>(`${environment.apiURL}${searchType.apiUrl}${searchValue?.searchValue}&ownerType=${searchValue?.ownerType}&pageNo=${searchValue?.pageNo}&itemPerPage=${searchValue?.itemPerPage}`,{},httpOptions).pipe(
      map((res) => {
        return res;
      })
    );
  }
  getAnimalHistory(tagId: any) {
    return this.http.get<HistoryDetail[]>(`${this.getHistory}${tagId}`).pipe(
      map((res) => {
        return res;
      })
    );
  }
  getBullDetailsByID(bullID: string) {
    return this.http.get<any>(`${this.apiUrl}animalbreeding/bullMaster/getBullDetails?bullId=${bullID}`).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
