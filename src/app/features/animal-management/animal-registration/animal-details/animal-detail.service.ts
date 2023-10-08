import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CompleteOwnerDetails } from '../../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { PregMonths } from '../models-animal-reg/preg-month.model';
import { RegAnimalDetails } from '../models-animal-reg/reg-animal-response.model';

const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root',
})
export class AnimalDetailService {
  public animalId: string = '';
  public ownerData!: CompleteOwnerDetails;
  parentComponent: string = '';
  animalRegFlag: boolean = false;
  ifAlreadySearched: boolean = false;

  registerAnimalUrl: string =
    BACKEND_URL + 'animalmanagement/animal/registerAnimalDetails';

  animalBasicDetailsUrl: string =
    BACKEND_URL + 'animalmanagement/animal/getAnimalDetails';

  animalImageDownloadUrl: string =
    environment.apiURL + 'commonutility/downloadImage';
  //previewAnimalImageUrl:string= environment.apiUrlAnimalMgmtCommon + 'v1/commonUtility/imagePreviewUrl';

  organizationDetailsUrl: string =
    environment.apiURL + 'admin/organization/getOrganizations';

  maxPregMonthURL =
    environment.apiURL + 'commonutility/getMaxPregnancyMonthsForSpecies';

  constructor(private http: HttpClient) {}

  registerAnimal(animalDetails: FormData) {
    return this.http.post<RegAnimalDetails>(
      this.registerAnimalUrl,
      animalDetails
    );
  }

  getPregMonthAccToSpecies(speciesCd) {
    let payload = new FormData();
    payload.append('speciesCd', speciesCd);
    return this.http.post<PregMonths>(this.maxPregMonthURL, payload);
  }

  setIfAlreadySearched(value: boolean) {
    this.ifAlreadySearched = value;
  }

  getIfAlreadySearched() {
    return this.ifAlreadySearched;
  }

  downloadAnimal(img) {
    return this.http.post(this.animalImageDownloadUrl, img);
  }

  getAnimalDetails(animalId: string) {
    const payload = new FormData();
    payload.append('animalId', animalId);
    return this.http.post<any>(this.animalBasicDetailsUrl, payload);
  }

  setAnimalId(id: string) {
    this.animalId = id;
  }

  getAnimalId() {
    return this.animalId;
  }

  setAnimalRegFlag(value: boolean) {
    this.animalRegFlag = value;
  }

  getAnimalRegFlag() {
    return this.animalRegFlag;
  }

  setOwnerData(ownerid: CompleteOwnerDetails) {
    this.ownerData = ownerid;
  }
  getOwnerData() {
    return this.ownerData;
  }

  getOrgs() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    let payload = {
      userId: user.userId,
      orgType: [1],
    };
    return this.http.post<any>(this.organizationDetailsUrl, payload);
  }

  setParentComponent(value: string) {
    this.parentComponent = value;
  }

  getParentComponent() {
    return this.parentComponent;
  }

  organizationFullDetails(id: string) {
    let url: string =
      environment.apiURL + 'admin/organization/getOrganizationDetails';
    let payload = {
      orgSubOrgId: id,
    };
    return this.http.post<any>(url, payload);
  }
}
