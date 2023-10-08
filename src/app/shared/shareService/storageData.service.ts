import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders  } from '@angular/common/http';
import { environment } from "../../../../src/environments/environment";
import { Observable, Subject } from "rxjs";

interface EncryptedDataModel {
    data: any;
    type: string;
  }

const BACKEND_URL =environment.apiURL;

@Injectable({
    providedIn: 'root',
  })

export class StorageDataService {
    private setData:any;
    private key:string;
  constructor(private http: HttpClient) {}

 

  /*SetData to SessionStorage with encrypted*/

  
        
   
  /*GetData to SessionStorage with decrypted*/

     
    
}