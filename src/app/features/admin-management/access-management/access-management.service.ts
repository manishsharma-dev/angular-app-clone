import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { Observable, throwError } from "rxjs";
import { retry, catchError } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";

import { Module, RoleDetails, Roles, SubModule } from "./model/role.model";
import { environment } from "src/environments/environment";



export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  picture: string;
}

export interface HttpResponseData {
  page: number;
  pageSize: number;
  pageCount: number;
  data: User[];
}

export interface Role{
  ID: number,
  roleId: string,
  role: string,
  module: string,
  subModule: string,
  status: string
}





@Injectable({
  providedIn: 'root',
})
export class AccessManagementService {
 
  public  Url= environment.apiURL;
  
  constructor(private http: HttpClient) {}


  getRoles():Observable<Roles[]> {
   return this.http.get<Roles[]>(`${this.Url}admin/user/getRoleList`);

  }
  getModuleList():Observable<Module[]>{
    return this.http.get<Module[]>(`${this.Url}admin/user/getModulesList`)

  }
  getSubModulesList(moduleId:number):Observable<SubModule[]>{
    console.log(moduleId)
    const payload={
      moduleCd:moduleId
    }
    return this.http.post<SubModule[]>(`${this.Url}commonutility/getSubModulesList?moduleCd=${moduleId}`, payload)

  }

  getRoleDetails(roleCd:number):Observable<RoleDetails[]>{
   const payload={
    "roleCd" : roleCd
   }
    return this.http.post<RoleDetails[]>(`${this.Url}admin/user/getRoleDetails`, payload)
   
  }

  deleteRole(roleCd) {
    const payload={
      "roleCd" : roleCd
     }
    return this.http.post(`${this.Url}admin/user/deleteRole`,payload);
  
      }
    
  

  // getUsers() {
  //   return this.http
  //     .get<HttpResponseData>("https://reqres.in/api/users?page=1")
  //     .pipe(map(response => this.createFromJson(response)));
  // }

  createUser(user): Observable<User> {
    return this.http.post<User>(
        `${this.Url}admin/user/createRole`,user)
    
  }

  updateUser(user): Observable<User> {
    return this.http.post<User>(
        `${this.Url}admin/user/updateRole`,user)
    
  }

  
  
}
