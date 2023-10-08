import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DistrictList } from './model/district.model';
import { StateList } from './model/state.model';
import { FLWVillages, TehsilList } from './model/tehsil.model';
import { VillageList } from './model/village.model';

const BACKEND_URL = environment.apiURL;

export interface StateName {
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  constructor(private http: HttpClient) {}

  getStates() {
    //  const lanType = {
    //     "language" : data
    //     }
    //   return this.http.post<State>(BACKEND_URL + "states", lanType).pipe(map(stateData => {
    //     return stateData;
    //   })
    //   )
    return this.http
      .get<StateList[]>(BACKEND_URL + 'commonutility/getStates')
      .pipe(
        map((res) => {
          return res;
        })
      );

    // return this.http.get<StateList[]>(BACKEND_URL + 'getStates').pipe(
    //   map((res) => {
    //     return res;
    //   })
    // );
    return this.http
      .get<StateList[]>(BACKEND_URL + 'commonutility/getStates')
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getStatesByUser() {
    return this.http
      .get<StateList[]>(BACKEND_URL + 'admin/organization/getStates')
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getDistrict(stateCode: number) {
    // const DistrictType = {
    //   "language" : data,
    //   "stateCode": stateCode
    //   }
    // return this.http.post<District>(BACKEND_URL + "districts" , DistrictType).pipe(map(districtData => {
    //   return districtData;
    // })
    // )
    return this.http
      .get<DistrictList[]>(BACKEND_URL + 'commonutility/getDistricts', {
        params: {
          stateCode: stateCode,
        },
      })
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  public getTehsil(districtCode: number) {
    // const PayloadBlock = {
    //   "language" : data,
    //   "districtCode": district_id
    //   }
    // return this.http.post<any>(BACKEND_URL + "blocks" , PayloadBlock);
    return this.http
      .get<TehsilList[]>(BACKEND_URL + 'commonutility/getTehsils', {
        params: {
          districtCode: districtCode,
        },
      })
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  public getVillages(tehsilCode: number) {
    // const PayloadVillages = {
    //   "language" : data,
    //   "blockCode": village_id
    //   }
    // return this.http.post<any>(BACKEND_URL + "villages" , PayloadVillages);
    return this.http
      .get<VillageList[]>(BACKEND_URL + 'commonutility/getVillages', {
        params: {
          tehsilCode: tehsilCode,
        },
      })
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  registerOwner(payload: any) {
    // return this.http.post<any>(BACKEND_URL + "owner/create", payload).pipe(map(data => {
    //   return data;
    // }))
  }

  fetchAddress() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    let payload = {
      userId: user.userId,
    };
    let url: string = environment.apiURL + 'admin/user/getVillagesForUser';
    return this.http.post<FLWVillages[]>(url, payload);
  }

  getAddressCode(payload) {
    let url: string =
      environment.apiURL + 'commonutility/getValueForRegionCode';
    return this.http.post<StateName>(url, payload);
  }
}
