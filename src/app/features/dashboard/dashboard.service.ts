import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { environment } from 'src/environments/environment';

import { MemberList } from './model/member.model';
import { CommonMaster } from '../animal-health/animal-treatment/models/common-master.model';

const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root'
})
export class DashBoardService {
  private readonly commonApiUrl = environment.apiURL + 'commonutility';
  public posts: MemberList[] = [];

  private membersUpdateList = new Subject<MemberList>();


  constructor(private http: HttpClient) { }


  get refreshNeeded() {
    return this.membersUpdateList;

  }



  getSelctedRole(seletcedRole: any) {
    this.membersUpdateList.next(seletcedRole);
  }

  getCommonMasterDetails(keyList: string[]) {
    return this.http.post<any>(
      this.commonApiUrl + '/getCommonMasterDetails',
      keyList
    );
  }

}
