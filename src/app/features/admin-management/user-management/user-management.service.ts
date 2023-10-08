import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './models/user.model';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { Common } from './models/common.model';
import { OrgList } from '../../animal-management/animal-registration/models-animal-reg/org-list.model';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { param } from 'jquery';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  countryService: any;
  Mydetails: any;
  public url = environment.apiURL;
  public userDetails: any;
  constructor(private http: HttpClient) {}

  userUpdateList = new BehaviorSubject<any>(false);

  getStates() {
    return this.http
      .get<StateList[]>(this.url + 'admin/organization/getStates')
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getdistrict(data) {
    var payload = {
      areaCode: data,
    };
    return this.http
      .post<any>(this.url + 'admin/organization/getDistricts', payload)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  gettehsil(data) {
    var payload = {
      areaCode: data,
    };
    return this.http
      .post<any>(this.url + 'admin/organization/getTehsils', payload)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getVillage(data) {
    var payload = {
      areaCode: data,
    };
    return this.http
      .post<any>(this.url + 'admin/organization/getVillages', payload)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createUser(data: FormData) {
    return this.http.post<User[]>(this.url + 'admin/user/saveuserDetail', data);
    // return this.http.post<User[]>('http://localhost:8086/epashu/v1/admin/user/saveuserDetail',data);
  }

  validateFile(payload: FormData) {
    return this.http.post(`${this.url}commonutility/validateFile`, payload);
  }

  updateUser(data: FormData) {
    return this.http.put<User[]>(
      this.url + 'admin/user/modifyuserDetail',
      data
    );
    // return this.http.put<User[]>("http://localhost:8086/epashu/v1/admin/user/modifyuserDetail",data)
  }

  manageUserArea(data) {
    return this.http.post<User[]>(this.url + 'admin/user/ManageUserArea', data);
  }

  updateUserArea(data) {
    return this.http.put<User[]>(
      this.url + 'admin/user/ManageUserAreaUpdate',
      data
    );
  }

  updateRoleArea(data) {
    return this.http.put<User[]>(
      this.url + 'admin/user/AssignRoleUserUpdate',
      data
    );
  }

  assignRoleUser(data) {
    return this.http.post<User[]>(this.url + 'admin/user/AssignRoleUser', data);
  }

  getUserList(val): Observable<User[]> {
    // getProjectList(val):Observable<Project[]> {
    return this.http.get<User[]>(
      this.url + `admin/user/getUserList?ownerText=${val}`
    );
    // }

    // return this.http.get<User[]>( this.url+"admin/user/getUserList")
  }

  getUserListFilterData(data) {
    return this.http.post<User[]>(
      this.url + 'admin/user/getUserFilterDisplayData',
      data
    );
  }

  getProjectListForUser(data) {
    return this.http.post<any[]>(
      this.url + 'admin/user/getProjectListForUser',
      data
    );
  }

  allocateProjectForUser(payload) {
    return this.http.post<any[]>(
      this.url + 'admin/user/allocateProjectForUser',
      payload
    );
  }

  getAssignedProjectListForUser(payload) {
    return this.http.post<any[]>(
      this.url + 'admin/user/getAssignedProjectListForUser',
      payload
    );
  }

  deallocateProjectForUser(payload) {
    return this.http.put<any[]>(
      this.url + 'admin/user/deallocateProjectForUser',
      payload
    );
  }

  getUserRecord(data): Observable<User[]> {
    return this.http.post<User[]>(
      this.url + `admin/user/getUserFilterTotalRecords`,
      data
    );
  }

  refreshNeeded() {
    return this.userUpdateList.asObservable();
  }

  getDetailsByUserID(id: string) {
    var payload = new FormData();
    payload.append('userId', id);
    return this.http
      .post<any>(this.url + 'admin/user/getUserDetails', payload)
      .pipe(
        tap(() => {
          //this.userUpdateList.next(true);
        })
      );
    // return this.http.post<any>("http://localhost:8086/epashu/v1/admin/user/getUserDetails",payload)
  }

  getCommonList($value: string) {
    var payload = {
      key: $value,
    };
    return this.http.post<Common[]>(
      this.url + 'commonutility/getCommonMaster',
      payload
    );
  }

  getOrgName() {
    return this.http.get<OrgList>(this.url + 'admin/organization/getOrgList');
  }

  getRoleList() {
    return this.http.get<any>(this.url + 'admin/user/getRoleList');
  }

  getRoleListHierarchyWise(data) {
    return this.http.post<any>(
      this.url + 'admin/user/getRoleListHierarchyWise',
      data
    );
  }

  getSubOrgList(suborgType, org?, state?) {
    const payload = {
      subOrgType: suborgType,
      orgId: org,
      stateCd: state,
      stateCheck: true,
    };
    return this.http.post<any>(
      this.url + 'admin/organization/getSubOrgList',
      payload
    );
  }

  //api calls for area allocation section

  getMultiState() {
    return this.http
      .get<StateList[]>(this.url + 'admin/organization/getStates')
      .pipe(
        map((res) => {
          return res.map((state: any) => {
            return {
              ...state,
              section: 'state',
            };
          });
        })
      );
  }

  getMultiDistricts(data: any) {
    var payload = {
      areaCode: data,
    };
    return this.http
      .post<any>(this.url + 'admin/organization/getDistricts', payload)
      .pipe(
        map((res) => {
          return res.map((district: any) => {
            return {
              ...district,
              section: 'district',
            };
          });
        })
      );
  }

  getMultiTehsils(data: any) {
    var payload = {
      areaCode: data,
    };
    return this.http
      .post<any>(this.url + 'admin/organization/getTehsils', payload)
      .pipe(
        map((res) => {
          return res.map((tehsil: any) => {
            return {
              ...tehsil,
              section: 'tehsil',
            };
          });
        })
      );
  }

  getMultiVillages(data): Observable<any[]> {
    var payload = {
      areaCode: data,
    };
    return this.http
      .post<any>(this.url + 'admin/organization/getVillages', payload)
      .pipe(
        map((res) => {
          return res.map((village: any) => {
            return {
              ...village,
              section: 'village',
            };
          });
        })
      );
  }
  //api calls for area allocation section
}
