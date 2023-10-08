import { AffiliationData } from './models-owner-reg/affiliation-data.model';
import { Observable } from 'rxjs';
import { RegisterOwner } from './models-owner-reg/register-owner.model';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ownerDetails } from './models-owner-reg/owner-details.model';
import { OwnerData } from './models-owner-reg/get-owner-details.model';
import { CommonData } from './models-owner-reg/common-data.model';
import { CompleteOwnerDetails } from './models-owner-reg/get-ownerby-ownerID.model';
import { InstitutionName } from './models-owner-reg/village-institution-name';
import { AdditionalDetails } from './models-owner-reg/add-details.model';
import { EditOwnerData } from './models-owner-reg/edit-owner-data.model';
import { GetAllOwners } from './models-owner-reg/getAllOwners.model';
import { BehaviorSubject } from 'rxjs';

interface OtpModel {
  message: string;
  isVerified: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class OwnerDetailsService {
  ownerDetails!: ownerDetails;
  isOwnerVerified: boolean = true;
  ownerDetailsTemp!: CompleteOwnerDetails;
  searchValue: string = '';
  ownerRegFlag: boolean = false;
  addDetailsFlag: boolean = false;
  editDetailsFlag: boolean = false;
  private navToOwnerReg = new BehaviorSubject<number>(1);
  navItem = this.navToOwnerReg.asObservable();
  commonMasterURL = environment.apiURL + 'commonutility/getCommonMaster';
  getOwners = environment.apiURL + 'animalmanagement/owner/getOwners/';
  getOwnerByID =
    environment.apiURL + 'animalmanagement/owner/getOwnerDetailsPageWise/';
  registerOwnerURL =
    environment.apiURL + 'animalmanagement/owner/registerOwnerDetails';
  registerNonIndOwnerURL =
    environment.apiURL +
    'animalmanagement/owner/registerNonIndividualOwnerDetails';
  villageInsNameURL = environment.apiURL + 'commonutility/fetchVillageDcsMpi';
  additionalOwnerDetailsURL =
    environment.apiURL +
    'animalmanagement/owner/registerOwnerAdditionalDetails';
  additionalNonIndOwnerDetailsURL =
    environment.apiURL +
    'animalmanagement/owner/registerNonIndividualOwnerAdditionalDetails';
  editOwnerDetailsURL =
    environment.apiURL + 'animalmanagement/owner/updateOwnerDetails';
  editNonIndOwnerDetailsURL =
    environment.apiURL +
    'animalmanagement/owner/updateNonIndividualOwnerDetails';

  getAllOwnersURL = environment.apiURL + 'animalmanagement/owner/getAllOwners';

  otpVerifyURL =
    environment.apiURL + 'animalmanagement/owner/ownerMobileNumberVerification';

  animalOtpVerifyURL =
    environment.apiURL +
    'animalmanagement/animal/animalRegistrationConfirmation';

  downloadPdfURL =
    environment.apiURL + 'animalmanagement/animal/downloadTransferDetails';

  ownerInitiateOtpUrl =
    environment.apiURL + 'animalmanagement/owner/initiateOtp';

  agencyRecordsUrl =
    environment.apiURL + 'commonutility/getVillageInstitutionsForUser';

  private httpClient: HttpClient;

  constructor(private http: HttpClient, private httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(httpBackend);
  }

  getOwnerByMobile(
    searchValue: string,
    isNonIndiOwner?: boolean,
    villageCd?: string
  ) {
    let payload = {};
    if (!villageCd) {
      payload = {
        text: searchValue,
        ownerType: isNonIndiOwner ? 2 : 1,
      };
    } else {
      payload = {
        text: searchValue,
        ownerType: isNonIndiOwner ? 2 : 1,
        ownerAddressCityVillageCd: villageCd,
      };
    }
    return this.http.post<OwnerData[]>(this.getOwners, payload);
  }

  getOwnerByOwnerID(
    ownerID?: string,
    isNonIndiOwner?: boolean,
    pageNo?: Number,
    itemPerPage?: Number,
    orgId?: string
  ) {
    let payload = {
      ownerId: ownerID,
      ownerType: isNonIndiOwner ? 2 : 1,
      pageNo: pageNo,
      itemPerPage: itemPerPage,
    };
    if (ownerID) {
      payload.ownerId = ownerID;
    } else if (orgId) {
      payload.ownerId = orgId;
    }
    // var payload = new FormData();
    // if (ownerID) {
    //   payload.append('ownerId', ownerID);
    // } else if (orgId) {
    //   payload.append('ownerId', orgId);
    // }
    return this.http.post<CompleteOwnerDetails>(this.getOwnerByID, payload);
  }
  // Additional Owner Details Flag
  setAddDetailsFlag(value: boolean) {
    this.addDetailsFlag = value;
  }
  getAddDetailsFlag() {
    return this.addDetailsFlag;
  }
  // Edit Owner Details Flag
  seteditDetailsFlag(value: boolean) {
    this.editDetailsFlag = value;
  }
  geteditDetailsFlag() {
    return this.editDetailsFlag;
  }
  // Owner Registration Flag
  setOwnerRegFlag(value: boolean) {
    this.ownerRegFlag = value;
  }
  getOwnerRegFlag() {
    return this.ownerRegFlag;
  }

  // Verification Flag

  setOwnerVerifiedFlag(value: boolean) {
    this.isOwnerVerified = value;
  }
  getOwnerVerifiedFlag() {
    return this.isOwnerVerified;
  }

  //Common Data

  getCommonData(value: string) {
    var payload = { key: value };
    return this.http.post<CommonData[]>(this.commonMasterURL, payload);
  }

  getVillageInstitutionName(value: number) {
    let payload = new FormData();
    payload.append('villageInstitutionType', String(value));
    return this.http.post<InstitutionName[]>(this.villageInsNameURL, payload);
  }

  registerOwnerDetails(ownerDetails: RegisterOwner) {
    return this.http.post<RegisterOwner>(this.registerOwnerURL, ownerDetails);
  }

  registerNonIndividualOwnerDetails(ownerDetails: RegisterOwner) {
    return this.http.post<RegisterOwner>(
      this.registerNonIndOwnerURL,
      ownerDetails
    );
  }

  addAdditionalOwnerDetails(addDetails: AdditionalDetails) {
    return this.http.post<AdditionalDetails>(
      this.additionalOwnerDetailsURL,
      addDetails
    );
  }

  addNonIndAdditionalOwnerDetails(addDetails: AdditionalDetails) {
    return this.http.post<AdditionalDetails>(
      this.additionalNonIndOwnerDetailsURL,
      addDetails
    );
  }

  editOwnerDetails(ownerDetails: EditOwnerData) {
    return this.http.post<EditOwnerData>(
      this.editOwnerDetailsURL,
      ownerDetails
    );
  }

  editNonIndOwnerDetails(ownerDetails: EditOwnerData) {
    return this.http.post<EditOwnerData>(
      this.editNonIndOwnerDetailsURL,
      ownerDetails
    );
  }

  verifyOtp(
    enteredOtp: string,
    ownerId?: string,
    mobileNumberForUpdate?: string,
    emailIdForUpdate?: string,
    animalId?: string
  ) {
    var payload = {};
    if (mobileNumberForUpdate) {
      payload = {
        ownerId: ownerId,
        ownerOtp: enteredOtp,
        mobileNumberForUpdate: mobileNumberForUpdate,
      };
      return this.http.post<OtpModel>(this.otpVerifyURL, payload);
    } else if (emailIdForUpdate) {
      payload = {
        ownerId: ownerId,
        ownerOtp: enteredOtp,
        emailIdForUpdate: emailIdForUpdate,
      };
      return this.http.post<OtpModel>(this.otpVerifyURL, payload);
    } else if (animalId) {
      payload = { animalId: animalId, animalOtp: enteredOtp };
      return this.http.post<OtpModel>(this.animalOtpVerifyURL, payload);
    } else {
      payload = { ownerId: ownerId, ownerOtp: enteredOtp };
      return this.http.post<OtpModel>(this.otpVerifyURL, payload);
    }
  }

  downloadFile(idList: Number[]) {
    const payload = { transferIdList: idList };
    return this.http.post(this.downloadPdfURL, payload, {
      responseType: 'blob',
    });
  }

  initiateOtp(id: string, mobileNo: string, text?: string) {
    var payload = {};
    if (text == 'animal') {
      payload = {
        id: id,
        mobileNo: mobileNo,
        text: 'animalId',
      };
    } else {
      payload = {
        id: id,
        mobileNo: mobileNo,
        text: 'ownerId',
      };
    }
    return this.http.post(this.ownerInitiateOtpUrl, payload);
  }

  // download pdf
  downloadPdfSrv(payload) {
    return this.http.post(this.downloadPdfURL, payload, {
      responseType: 'blob',
      observe: 'body',
    });
  }

  getAllOwners(text: string) {
    var payload = { text: text };
    return this.http.post<GetAllOwners>(this.getAllOwnersURL, payload);
  }

  refreshOwnerDetails() {
    this.navToOwnerReg.next(1);
  }

  getRecordsForAgency() {
    return this.http.get<AffiliationData[]>(this.agencyRecordsUrl);
  }
}
