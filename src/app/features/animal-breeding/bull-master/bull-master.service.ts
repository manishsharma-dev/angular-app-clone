import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Breed } from './bull-master-model/bull-master.model';
import { AnimalResult } from '../../animal-management/animal-registration/models-animal-reg/tagId-search.model';

@Injectable({
  providedIn: 'root',
})
export class BullMasterService {
  apiUrl: string = environment.apiURL;

  constructor(private http: HttpClient) {}

  getBullDetails(searchValue: any) {
    return this.http.get<any>(
      `${this.apiUrl}animalbreeding/bullMaster/getBullsList`,
      { params: { ...searchValue } }
    );
  }
  getCommonMaster(key: string) {
    return this.http.post(
      `${environment.apiURL}commonutility/getCommonMaster`,
      {
        key,
      }
    );
  }
  getBreeds(speciesCd: string) {
    let payload = { speciesCode: speciesCd };
    return this.http.post<Breed[]>(
      `${environment.apiURL}commonutility/getBreed`,
      payload
    );
  }

  getsearchDetails(searchKey: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        type: 'AddBullMaster',
      }),
    };
    return this.http.post(
      `${this.apiUrl}animalbreeding/search/getSearchDetails?searchCriteria=${searchKey}`,
      {},
      httpOptions
    );
   
      // let payload = new FormData();
      // payload.append('TagId', searchKey);
      // return this.http.post<AnimalResult>(this.apiUrl +'animalmanagement/animal/getAnimalDetailsByTagId', payload);
    
  }

  savebullDetails(bullDetail: object) {
    return this.http.post(
      `${this.apiUrl}animalbreeding/bullMaster/saveBullAdditionalDetails`,
      bullDetail
    );
  }

  savebullMastersDetails(bullMasterDetail: object) {
    return this.http.post(
      `${this.apiUrl}animalbreeding/bullMaster/saveBullDetails`,
      bullMasterDetail
    );
  }

  getBullDetailsByID(bullID: string) {
    return this.http
      .get<any>(
        `${this.apiUrl}animalbreeding/bullMaster/getBullDetails?bullId=${bullID}`
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  updateBullMastersDetails(bullDetail: object) {
    return this.http.put(
      `${this.apiUrl}animalbreeding/bullMaster/updateBullDetails`,
      bullDetail
    );
  }

  getOrganizationList(org_type, stateCheck = true) {
    return this.http.post(`${this.apiUrl}admin/organization/getSubOrgList`, {
      ...org_type,
      stateCheck,
    });
  }

  bullSireDetails(req: any) {
    return this.http.post(
      `${this.apiUrl}animalbreeding/bullMaster/additionalDetails/bullSireDetails`,
      req
    );
  }

  bullDamDetails(req: any) {
    return this.http.post(
      `${this.apiUrl}animalbreeding/bullMaster/additionalDetails/bullDamDetails`,
      req
    );
  }

  bullSemenDetails(req: any) {
    return this.http.post(
      `${this.apiUrl}animalbreeding/bullMaster/additionalDetails/bullSemenDetails`,
      req
    );
  }
  getSubOrgDetails(data) {
    const payload = {
      orgSubOrgId: data,
    };
    return this.http.post(
      `${this.apiUrl}admin/organization/getSubOrgDetails`,
      payload
    );
  }
}
