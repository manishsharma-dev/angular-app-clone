import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserRollService {
  public roll: any = [];
  public selectedRoll = [];
  rollTemp: any;
  constructor(private http: HttpClient) { }
  url = environment.apiURL
  getRoll(term: string = null): Observable<any> {
    let items = getMockRoll();
    if (term) {
      items = items.filter(x => x.roll.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
    }
    return of(items).pipe(delay(500));
  }

  setRollDetails(areaDetail) {
    this.rollTemp = areaDetail;
    // console.log(this.rollTemp,"retrggdgdgdgdgdg::::")
  }

  getRollDetails() {
    return this.rollTemp;
  }


  // getOrgDetail() {
  // const payload = {
  //   "orgSubOrgId" : "49883802"
  //   }
  //   return this.http.post("http://localhost:8086/epashu/v1/admin/organization/getOrgDetails",payload)
  // }

  // getSubOrgList():Observable<subOrganization[]> {
  //   return this.http.get<subOrganization[]>("http://localhost:8086/epashu/v1/admin/subOrganization/getSubOrgList")
  // }


}



function getMockRoll() {
  return [
    {
      'id': '1',
      'roll': 'Vaccinator'
    },
    {
      'id': '2',
      'roll': 'AI Technician'
    },
    {
      'id': '3',
      'roll': 'AI Sr.Technician'
    },
    {
      'id': '4',
      'roll': 'VaccLab Manager',
    }
  ]
}



