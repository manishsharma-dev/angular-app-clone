import { CommonRes } from './../models/common-res.model';
import { UpdateReq } from './models/update-req.model';
import { IntimationReportDetails } from './models/intimation-report-details.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IntimationListRes } from './models/intimation-list-response.model';
import { SaveIntimationResponse } from './models/save-intimation-response.model';
import { Village } from './models/village.model';

const BACKEND_URL = environment.apiURL + 'admin/user/';
const COMMON_URL = environment.apiURL + 'commonutility/';

@Injectable({
  providedIn: 'root',
})
export class IntimationReportService {
  private readonly apiUrl =
    environment.apiURL + 'animalhealthdiseasereporting/intimationreport/';
  constructor(private httpClient: HttpClient) { }

  getVillagesByUser(userId?: string) {
    return this.httpClient.post<Village[]>(BACKEND_URL + 'getVillagesForUser', {
      userId: JSON.parse(sessionStorage.getItem('user'))?.userId,
    });
  }

  getValueForRegionCode(code: number, key: number) {
    return this.httpClient.post<{ value: string }>(
      COMMON_URL + 'getValueForRegionCode',
      {
        code,
        key,
      }
    );
  }

  viewIntimationReport(intimationId: number) {
    return this.httpClient.post<IntimationReportDetails>(
      this.apiUrl + 'viewIntimationReport',
      {
        intimationId,
      }
    );
  }

  saveIntimationReport(req: any) {
    return this.httpClient.post<CommonRes<SaveIntimationResponse>>(
      this.apiUrl + 'saveIntimationReportData',
      req
    );
  }

  getIntimationReportListForUser() {
    return this.httpClient.post<IntimationListRes[]>(
      this.apiUrl + 'getIntimationReportListForUser',
      {}
    );
  }

  updateIntimationReport(req: UpdateReq) {
    return this.httpClient.post<CommonRes<SaveIntimationResponse>>(
      this.apiUrl + 'updateIntimationReport',
      req
    );
  }

  getVillages(term: string = null) {
    let items = [
      { name: 'Amber', selected: false },
      { name: 'Aradka', selected: false },
      { name: 'DB Kalan', selected: false },
    ];
    if (term) {
      items = items.filter(
        (x) => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1
      );
    }
    return of(items).pipe(delay(500));
  }

  getTeshil(term: string = null) {
    let items = [
      { name: 'Thanesar ', selected: false },
      { name: 'Ladwa', selected: false },
      { name: 'Shahbad', selected: false },
      { name: 'Pehowa ', selected: false },
    ];
    if (term) {
      items = items.filter(
        (x) => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1
      );
    }
    return of(items).pipe(delay(500));
  }

  getControls(term: string = null) {
    let items = [
      { name: 'Targeted Surveillance ', selected: false },
      { name: 'Vaccination in response to outbreak', selected: false },
    ];
    if (term) {
      items = items.filter(
        (x) => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1
      );
    }
    return of(items).pipe(delay(500));
  }
}
