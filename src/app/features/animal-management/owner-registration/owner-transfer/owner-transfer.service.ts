import { OwnerTransferInitiation } from './../models-owner-reg/ownership-transfer.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AnimalRegistrationList } from '../models-owner-reg/get-ownerby-ownerID.model';
import { environment } from '../../../../../environments/environment';
import { encryptText } from 'src/app/shared/shareService/storageData';
@Injectable({
  providedIn: 'root',
})
export class OwnerTransferService {
  ownerDetails: string[] = [];
  selectedTags: string[] = [];
  animalData: AnimalRegistrationList[] = [];
  animalIDs: string[] = [];
  ownerName: string = '';
  soldFlag: boolean = false;
  ownershipInitiationURL: string =
    environment.apiURL + 'animalmanagement/owner/ownerTransferInitiated';

  ownershipConfirmationURL =
    environment.apiURL + 'animalmanagement/owner/ownerTransferConfirmation';

  takeOwnershipURL =
    environment.apiURL + 'animalmanagement/owner/allocatePendingAnimalToOwner';
  ownerTransferGenerateOtpUrl =
    environment.apiURL +
    'animalmanagement/owner/initiateAnimalTransferAfterOwnerReg';

  constructor(private http: HttpClient) {}

  setAnimalIDs(animalIDs: string[]) {
    this.animalIDs = animalIDs;
  }
  getAnimalIDs() {
    return this.animalIDs;
  }

  setAnimalData(animalData: AnimalRegistrationList[]) {
    this.animalData = animalData;
  }
  getAnimalData() {
    return this.animalData;
  }

  getOwnerName() {
    return this.ownerName;
  }
  setOwnerName(data: string) {
    this.ownerName = data;
    var name = this.ownerName.split(' ');
    let index = 0;
    for (let ele of name) {
      if (ele == 'undefined') {
        name[index] = '';
      }
      index++;
    }
    this.ownerName = name.join(' ');
  }

  getSelectedTags() {
    return this.selectedTags;
  }

  setSelectedTags(receivedList: string[]) {
    this.selectedTags = receivedList;
  }

  setSoldFlagStatus(val: boolean) {
    this.soldFlag = val;
  }
  getSoldFlagStatus() {
    return this.soldFlag;
  }

  ownershipTransferInitiation(
    transferData: OwnerTransferInitiation,
    flag: boolean
  ) {
    transferData.resendOtp = flag;
    return this.http.post(this.ownershipInitiationURL, transferData).pipe(
      map((data) => {
        return data;
      })
    );
  }

  ownershipTransferConfirmation(payload) {
    return this.http.post(this.ownershipConfirmationURL, payload);
  }

  generateOtpForTransfer(ownerId: string, animalIDs: string[]) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    var payload = {
      newOwnerId: ownerId,
      animalIds: animalIDs,
    };
    return this.http.post(this.ownerTransferGenerateOtpUrl, payload);
  }

  takeOwnership(payload) {
    return this.http.post(this.takeOwnershipURL, payload);
  }
}
