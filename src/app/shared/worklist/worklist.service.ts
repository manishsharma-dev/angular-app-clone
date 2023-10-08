import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WorkListDetails } from './model/worklist.model';

const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root',
})
export class WorklistService {
  worklistDetailsUrlSupervisor =
    BACKEND_URL + 'commonutility/getWorkListForSuperUser';
  worklistDetailsUrlUser = BACKEND_URL + 'commonutility/getWorkListForUser';
  acceptRejectWorklistUrl = BACKEND_URL + 'commonutility/performAction';
  recentWorklistForSupervisor =
    BACKEND_URL + 'commonutility/getRecentWorkListForSupervisor';
  recentWorklistForUser =
    BACKEND_URL + 'commonutility/getRecentWorkListForUser';

  constructor(private http: HttpClient) {}

  fetchWorkListData(
    pageNo: Number,
    itemPerPage: Number,
    moduleCode: Number,
    fromDate: string,
    toDate: string,
    filter?: Array<number>
  ) {
    let payload = {
      filter: filter,
      pageNo: pageNo,
      itemPerPage: itemPerPage,
      moduleCode: moduleCode,
      fromDate: fromDate,
      toDate: toDate,
    };
    return this.http.post<WorkListDetails>(
      this.worklistDetailsUrlSupervisor,
      payload
    );
  }

  fetchWorkListDataUser(
    pageNo: Number,
    itemPerPage: Number,
    moduleCode: Number,
    fromDate: string,
    toDate: string,
    filter?: Array<number>
  ) {
    let payload = {
      filter: filter,
      pageNo: pageNo,
      itemPerPage: itemPerPage,
      moduleCode: moduleCode,
      fromDate: fromDate,
      toDate: toDate,
    };
    return this.http.post<WorkListDetails>(
      this.worklistDetailsUrlUser,
      payload
    );
  }

  getRecentWorkListForSupervisor() {
    return this.http.post(this.recentWorklistForSupervisor, {});
  }

  getRecentWorkListForUser() {
    return this.http.post(this.recentWorklistForUser, {});
  }

  performAction(requestId: any, action: number, remarks: string) {
    let payload = {
      requestId: requestId,
      actionToPerform: action,
      msg: remarks,
    };
    return this.http.post(this.acceptRejectWorklistUrl, payload);
  }
}
