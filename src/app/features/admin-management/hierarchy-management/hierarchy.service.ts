import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddNewHierarchy, Hierarchy, HierarchyDetails, RoleArea } from './models/hierarchy.model';

@Injectable({
  providedIn: 'root'
})

export class HierarchyService {
  public  Url= environment.apiURL;
  dataSource: MatTableDataSource<Hierarchy>
 

  constructor(private http:HttpClient) { }

  getHierarchy():Observable<Hierarchy[]> {
    return this.http.get<Hierarchy[]>(`${this.Url}admin/user/getHierarchyList`)
  }
  getRoleArea():Observable<RoleArea[]>{
    let payload={
      "key" : "role_area"
    }
   return this.http.post<RoleArea[]>(`${this.Url}commonutility/getCommonMaster`,payload)
  }

  getRoleLists():Observable<any[]>{
    let payload={
      "key" : ""
    }
   return this.http.post<any[]>(`${this.Url}commonutility/getRoleList`,payload)
  }

  onCreateHierarchy(payload:AddNewHierarchy):Observable<AddNewHierarchy[]>{
   return this.http.post<AddNewHierarchy[]>(`${this.Url}admin/user/addNewHierarchy`,payload)
  }
  onUpdateHierarchy(payload:AddNewHierarchy):Observable<AddNewHierarchy[]>{
    return this.http.post<AddNewHierarchy[]>(`${this.Url}admin/user/updateHierarchy`,payload)
   }

  getHierarchyDetails(data):Observable<HierarchyDetails[]>{
    const payload={
      hierarchyId:data
    }
    return this.http.post<HierarchyDetails[]>(`${this.Url}admin/user/fetchHierarchyDetails`,payload)
  }

  deleteHierarchy(data):Observable<Hierarchy[]>{
    const payload={
      hierarchyId:data
    }
    return this.http.post<Hierarchy[]>(`${this.Url}admin/user/deleteHierarchy`,payload)
  }

  

}
