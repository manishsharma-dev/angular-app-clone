import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/features/auth/auth.service';
import {
  getDecryptedProjectData,
  getDecryptedRoleData,
  getSessionData,
} from 'src/app/shared/shareService/storageData';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notificationDetailsUrl = BACKEND_URL + 'commonutility/getNotificationAlerts';
  moduleListUrl = BACKEND_URL + 'commonutility/getModulesList';
  getRecentNotificationsUrl =
    BACKEND_URL + 'commonutility/getRecentNotifications';
  getNotificationCountURL = BACKEND_URL + 'commonutility/getNotificationsCount';
  private http1: HttpClient;
  constructor(
    private http: HttpClient,
    private handler: HttpBackend,
    private authService: AuthService
  ) {
    this.http1 = new HttpClient(handler);
  }

  fetchNotificationData(
    pageNo: Number,
    itemPerPage: Number,
    moduleCode: Number,
    fromDate: string,
    toDate: string,
    filter?: Array<number>
  ) {
    let payload = {
      filterBy: [0],
      pageNo: pageNo,
      itemPerPage: itemPerPage,
      moduleCode: moduleCode,
      fromDate: fromDate,
      toDate: toDate,
    };
    return this.http.post<any>(this.notificationDetailsUrl, payload);
  }

  fetchModulesList() {
    return this.http.get(this.moduleListUrl);
  }

  getNotificationCount() {
    return this.http.get<{ unreadCount: number }>(this.getNotificationCountURL);
  }

  fetchRecentNotificationsList() {
    // let headers: HttpHeaders = new HttpHeaders();
    // headers = headers.append('Authorization', `Bearer ${this.authService.getToken()}`);
    // headers = headers.append('roleCd', getDecryptedRoleData("AESSHA256userDataRole").id || '');
    // headers = headers.append('projectId', getDecryptedProjectData("AESSHA256storageProjectData").id || '');
    // headers = headers.append('subModuleCd', getSessionData('subModuleCd')?.subModuleCd.toString());
    // headers = headers.append('langCd', getSessionData('language') ? getSessionData('language').toString() : '');
    return this.http.post(this.getRecentNotificationsUrl, {});
  }
}
