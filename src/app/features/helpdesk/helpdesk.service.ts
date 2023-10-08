import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserManual } from './models/user-manual.model';
const BACKEND_URL = environment.apiURL + 'commonutility/';
@Injectable({
  providedIn: 'root',
})
export class HelpdeskService {
  constructor(private http: HttpClient) { }

  getModuleList() {
    return this.http.get(`${BACKEND_URL}getModulesList`);
  }
  getSubmoduleList(moduleId: number) {
    return this.http.post(
      `${BACKEND_URL}getSubModulesList?moduleCd=${moduleId}`,
      {}
    );
  }

  getUserActivityList(request: any) {
    return this.http.post(
      `${BACKEND_URL}report/getGeoTransactionSummary`,
      request
    );
  }

  getUserManualUrl(request: any) {
    return this.http.post<UserManual>(
      `${BACKEND_URL}getUserManualUrls`,
      request
    );
  }
}
