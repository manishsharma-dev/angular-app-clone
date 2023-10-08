import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Organization } from './model/organization.model';
import {
  SampleExaminationSubtypeMaster,
  subOrganization,
} from './model/subOrganization.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationManagementService {
  public Url = environment.apiURL;
  constructor(private http: HttpClient) {}

  createOrg(data: FormData) {
    return this.http.post<Organization[]>(
      `${this.Url}admin/organization/createOrganization`,
      data
    );
  }

  upadateOrg(data: FormData) {
    return this.http.post<Organization[]>(
      `${this.Url}admin/organization/updateOrganization`,
      data
    );
  }
  getOrgList(): Observable<Organization[]> {
    return this.http.get<Organization[]>(
      `${this.Url}admin/organization/getOrgList`
    );
  }

  getOrgDetail(orgId: number | string) {
    const payload = {
      orgSubOrgId: orgId,
    };
    return this.http.post(
      `${this.Url}admin/organization/getOrgDetails`,
      payload
    );
  }

  createSubOrg(data: FormData) {
    return this.http.post<subOrganization[]>(
      `${this.Url}admin/organization/createSubOrganization`,
      data
    );
  }
  updateSubOrg(data: FormData) {
    return this.http.post<subOrganization[]>(
      `${this.Url}admin/organization/updateSubOrganizationDetails`,
      data
    );
  }

  // getSubOrgList(): Observable<subOrganization[]> {
  //   const payload = {
  //     subOrgType: 0,
  //     stateCheck: true,
  //   };
  //   return this.http.post<subOrganization[]>(
  //     `${this.Url}admin/organization/getSubOrgList`,
  //     payload
  //   );
  // }

  getSubOrgList(payload): Observable<subOrganization[]> {
   
    return this.http.post<subOrganization[]>(
      `${this.Url}admin/organization/getSubOrgListBySearch`,
      payload
    );
  }


  getSubOrgDetails(data): Observable<subOrganization[]> {
    const payload = {
      orgSubOrgId: data,
    };
    return this.http.post<subOrganization[]>(
      `${this.Url}admin/organization/getSubOrgDetails`,
      payload
    );
  }

  getOrgTypeSvc() {
    const payload = {
      key: 'org_type',
    };

    return this.http.post(`${this.Url}commonutility/getCommonMaster`, payload);
  }

  getSubOrgTypeSvc() {
    const payload = {
      key: 'sub_org_type',
    };

    return this.http.post(`${this.Url}commonutility/getCommonMaster`, payload);
  }

  getOrgStatusSvc() {
    const payload = {
      key: 'org_status',
    };

    return this.http.post(`${this.Url}commonutility/getCommonMaster`, payload);
  }
  validateFile(payload: FormData) {
    return this.http.post(`${this.Url}commonutility/validateFile`, payload);
  }

  getSampleExaminationSubtypeMaster(): Observable<
    SampleExaminationSubtypeMaster[]
  > {
    const payload = {
      sampleExaminationTypeCd: '1',
    };

    return this.http.post<SampleExaminationSubtypeMaster[]>(
      `${this.Url}animalhealthtestingsamples/getSampleExaminationSubtypeMaster`,
      payload
    );
  }
}
