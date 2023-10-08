import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, retry, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LabList } from './model/lab.model';
import { LabName } from './model/labName.model';
import { MemberList } from './model/member.model';

const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  public posts: MemberList[] = [];
  
  private membersUpdateList = new Subject<MemberList>();


  constructor(private http: HttpClient) { }

  
  get refreshNeeded() {
    return this.membersUpdateList; 
    
  }

 
  
  getSelctedRole(seletcedRole:any){
    this.membersUpdateList.next(seletcedRole);
   }

 
 
}
