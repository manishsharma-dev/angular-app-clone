import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders  } from '@angular/common/http';
import { environment } from "src/environments/environment";

const BACKEND_URL =environment.apiUrl;
@Injectable()
export class RoleService {
  constructor(private http: HttpClient) {}

  getTransferIp() {
 
        return this.http.get<any>(BACKEND_URL + 'role')
      
    // let header = new HttpHeaders().set(
    //   "Authorization",
    //    localStorage.getItem("token")
    // );

    // return this.http.get("BACKEND_URL + 'role'", {headers:header});
  }
}