import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { encryptText } from 'src/app/shared/shareService/storageData';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  emailExistURL =
    environment.apiURL + 'animalmanagement/owner/checkIfEmailExist';
  earTagExistURL =
    environment.apiURL + 'animalmanagement/animal/validateEarTag';
  aadhaarExistURL =
    environment.apiURL + 'animalmanagement/owner/validateAadharExistence';
  userAadhaarExistURL =
    environment.apiURL + 'admin/user/validateAadharExistence';
  semenStationCdExitsURL =
    environment.apiURL + 'admin/organization/ifSemenStationAllocated';

  constructor(private http: HttpClient) {}

  public getUserByEmail(email: string) {
    const payload = { emailId: email };
    return this.http.post(this.emailExistURL, payload);
  }

  public getEarTag(tagId: string) {
    const payload = new FormData();
    payload.append('tagId', tagId);
    return this.http.post(this.earTagExistURL, payload);
  }

  public getAadhaar(aadhaarNumber: string) {
    let aadhaarNo = encryptText(aadhaarNumber);
    const payload = new FormData();
    payload.append('aadhaarNumber', aadhaarNo);
    return this.http.post(this.aadhaarExistURL, payload);
  }

  public getAadhaarUser(aadhaarNumber: string) {
    const payload = new FormData();
    payload.append('aadhaarNumber', aadhaarNumber);
    return this.http.post(this.userAadhaarExistURL, payload);
  }
  public semenStationCdExist(semenStationCd: string) {
    const payload = { semenStationCd: semenStationCd };
    return this.http.post(this.semenStationCdExitsURL, payload);
  }
}
