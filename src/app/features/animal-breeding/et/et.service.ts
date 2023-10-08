import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OwnerDetails } from 'src/app/shared/shareService/model/owner.detail';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EtService {
  apiUrl: string = environment.apiURL;
  // apiUrl: string = 'http://localhost:8090/epashu/v1/';

  // commonMasterUrl : string = environment.apiURL

  constructor(private http: HttpClient) {}

  saveHeatTransaction(params: any) {
    return this.http.post(
      this.apiUrl + 'animalbreeding/et/saveHeatDetails',
      params
    );
  }
  // Common Master APIs
  getCommonMaster(key: string) {
    return this.http.post(
      environment.apiURL + 'commonutility/getCommonMaster',
      {
        key,
      }
    );
  }

  saveETDetails(params: any) {
    return this.http.post(
      this.apiUrl + 'animalbreeding/et/saveEtDetails',
      params
    );
  }
  getEmbryoIDs(params: any) {
    return this.http.post(
      this.apiUrl + 'animalbreeding/et/getEmbryoIds',
      params
    );
  }
  saveEmbryoMasterDetails(params: any) {
    return this.http.post(
      this.apiUrl + 'animalbreeding/et/saveEmbryoMaster',
      params
    );
  }
  searchOwnerDetails(searchValue: string) {
    return this.http
      .get<OwnerDetails[]>(
        `${this.apiUrl}animalbreeding/search/getSearchDetails?searchCriteria=${searchValue}`
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  saveSyncDetails(params: any) {
    return this.http.post(
      this.apiUrl + 'animalbreeding/et/saveSyncDetails',
      params
    );
  }
  getHeatType(tagId: number) {
    return this.http.get(
      `${this.apiUrl}animalbreeding/et/getHeatType?tagId=${tagId}`
    );
  }
  verifyEmbryoID(embryo_Id: any) {
    return this.http.get(
      `${this.apiUrl}animalbreeding/et/getEmbryoDetails?embryoId=${embryo_Id}`
    );
  }
  getHeatTransactionHistory(tagId: number) {
    return this.http.get(
      `${this.apiUrl}animalbreeding/et/getHeatTransactionHistory?tagId=${tagId}`
    );
  }
  getEmbryoMasterList() {
    return this.http.get(`${this.apiUrl}animalbreeding/et/getEmbryosForLab`);
  }
  // getEmbryoDetails(params:any){
  //   return this.http.get(`${this.apiUrl}animalbreeding/et/getEmbryoDetails?embryoId=${params?.embryo_Id}&userId=${params?.user_Id}`);
  // }
  updateEmbryoDetails(params: any) {
    return this.http.post(
      `${this.apiUrl}animalbreeding/et/updateEmbryoDetails`,
      params
    );
  }
  getOrganizationList() {
    return this.http.get(`${this.apiUrl}admin/organization/getOrgList`);
  }
  allocateEmbryoIds(params: any) {
    return this.http.post(
      this.apiUrl + 'animalbreeding/et/allocateOrDeallocateEmbryoToOrg',
      params
    );
  }
  deleteAndDiscardEmbryo(params) {
    return this.http.post(
      this.apiUrl + 'animalbreeding/et/deleteAndDiscardEmbryo',
      params
    );
  }

  getActiveUsersByRoleCd(obj: { roleCd: number; orgId: number }) {
    return this.http.post<User[]>(
      this.apiUrl + 'admin/user/getActiveUsersByRoleCd',
      obj
    );
  }

  getAssociatedEmbryoIds() {
    return this.http.get<string[]>(
      this.apiUrl + 'animalbreeding/et/getAssociatedEmbryoIds'
    );
  }
}

export interface User {
  userId: string;
  userEmailId: string;
  userLoginId: string;
  userName: string;
  orgId: number;
  userMobileNo: number;
  orgAddress: string;
  orgName: string;
  orgRegistrationNo: string;
  orgType: number;
  orgStateCd: number;
  orgDistrictCd: number;
  orgMobileNo: number;
}
