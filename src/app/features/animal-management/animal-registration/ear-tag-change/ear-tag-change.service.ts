import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { OrgList } from '../models-animal-reg/org-list.model';

const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root',
})
export class EarTagChangeService {
  earFlag: boolean = false;
  newTagNumber: string = '';
  animalTranscURL =
    BACKEND_URL + 'animalmanagement/animal/checkAnyAnimalTransactionForTagId';
  constructor(private http: HttpClient) {}

  orgURL = 'assets/org_list.json';

  getOrgList() {
    return this.http.get<OrgList[]>(this.orgURL).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getEarFlagStatus() {
    return this.earFlag;
  }

  setEarFlagStatus(isChanged: boolean) {
    this.earFlag = isChanged;
  }

  getNewEarTagNumber() {
    return this.newTagNumber;
  }

  setNewTagNumber(newTagNumber: string) {
    this.newTagNumber = newTagNumber;
  }

  // earTagChange(animalDetails: any) {
  //   return this.http.post<any>(
  //     BACKEND_URL + 'animalmanagement/animal/performEarTagChange',
  //     animalDetails
  //   );
  // }

  earTagChange(animalDetails: any) {
    return this.http.post<any>(
      BACKEND_URL + 'animalmanagement/animal/performEarTagChange',
      animalDetails
    );
  }

  checkAnyAnimalTransactionForTagId(tagId: any) {
    let formData = new FormData();
    formData.append('tagId', tagId);
    //return this.http.post(BACKEND_URL +'animalmanagement/animal/checkAnyAnimalTransactionForTagId',formData)
    return this.http.post(this.animalTranscURL, formData);
  }
}
