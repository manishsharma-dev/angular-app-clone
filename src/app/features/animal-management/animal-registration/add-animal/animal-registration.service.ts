import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// const BACKEND_URL = environment.apiUrlAnimalMgmt;

@Injectable({
  providedIn: 'root'
})

export class AddAnimalService {
  constructor(private http:HttpClient) { }

  // registerAnimal(payload:any){
  //   return this.http.post<any>(BACKEND_URL + "animal/animalcreate" ,payload).pipe(map(data=>{
  //     return data;
  //   }))
  // }

  // getAnimal(){
  //   return this.http.get<any>(BACKEND_URL + "animal/getanimals").pipe(map(data=>{
  //     return data;
  //   }))
  // }

  // searchOwner(mobileNo) {
  //   return this.http.get<any>(BACKEND_URL + "owner/mobile/" + mobileNo).pipe(map(data=>{
  //     return data;
  //   }))
  // }  
}
