import { PreviewHierarchyDialogComponent } from './../../admin-management/hierarchy-management/preview-hierarchy-dialog/preview-hierarchy-dialog.component';
import { Breed } from './models-animal-reg/breed-list.model';
import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { AnimalRegistrationList } from '../owner-registration/models-owner-reg/get-ownerby-ownerID.model';
import { AnimalResult } from './models-animal-reg/tagId-search.model';
import { environment } from '../../../../environments/environment';
import { AnimalTransactions } from './models-animal-reg/animal-Transaction.model';
import { dsvFormat } from 'd3';
import { LastTransactionDate } from './models-animal-reg/last-Tranc-date.model';
import { shareReplay } from 'rxjs/operators';
import { encryptText } from 'src/app/shared/shareService/storageData';
import { LatestTags } from './models-animal-reg/latest-tag.model';

interface CurrentDate {
  value: string;
}

const BACKEND_URL = environment.apiURL;

@Injectable({
  providedIn: 'root',
})
export class AnimalManagementService {
  private httpClient: HttpClient;
  constructor(private http: HttpClient, private httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(httpBackend);
  }
  animalEdited!: AnimalRegistrationList;
  isAnimalAdditionalDetails: boolean = false;
  isAnimalEdited: boolean = false;
  getBreedURL = environment.apiURL + 'commonutility/getBreed';
  updateAnimalURL = BACKEND_URL + 'animalmanagement/animal/updateAnimalDetails';
  additionalAnimalURL =
    environment.apiURL + 'animalmanagement/animal/addAnimalAdditionalDetails';

  ownerTransferHistoryURL =
    BACKEND_URL + 'animalmanagement/animal/ViewAnimalTransferTransactions';

  earTagHistoryURL =
    BACKEND_URL + 'animalmanagement/animal/ViewAnimalTagTransactions';

  getDetailsByTagIdURL =
    BACKEND_URL + 'animalmanagement/animal/getAnimalDetailsByTagId';

  getDamSireIdFromDamIdURL =
    environment.apiURL +
    'animalmanagement/animal/getAnimalDetailByAnimalAttribute';

  viewAnimalTransactionsURL =
    environment.apiURL + 'animalmanagement/animal/viewAnimalTransactions';

  currentDateURL =
    environment.apiURL + 'animalmanagement/animal/getCurrentDate';

  getAnimalMgmtConfigURL =
    environment.apiURL + 'commonutility/getConfigDetails';

  validateFileURL = environment.apiURL + 'commonutility/validateFile';

  tagChangeURL = environment.apiURL + 'commonutility/getCommonMaster';

  lastTransactionDateURL =
    environment.apiURL +
    'animalmanagement/animal/getLastTransactionDateOfAnimal';

  panExistURL = environment.apiURL + 'animalmanagement/owner/validatePanNumber';
  latestTagURL =
    environment.apiURL + 'animalmanagement/animal/getLatestTagForAnimal';

  getBreeds(speciesCd: string) {
    let payload = { speciesCode: speciesCd };
    return this.http.post<Breed[]>(this.getBreedURL, payload);
  }

  getLastTransactionDate(animalId: Array<String>) {
    let payload = { animalIds: animalId };
    return this.http.post<LastTransactionDate>(
      this.lastTransactionDateURL,
      payload
    );
  }

  validateFile(recFile: File) {
    let formData: any = new FormData();
    formData.append('key', 'animalRegistrationImage');
    formData.append('file', recFile);
    return this.http.post<boolean>(this.validateFileURL, formData);
  }

  updateAnimalDetails(payload) {
    this.isAnimalEdited = true;
    return this.http.post(this.updateAnimalURL, payload);
  }

  additionalAnimalDetails(payload) {
    return this.http.post(this.additionalAnimalURL, payload);
  }

  validatePAN(panNumber: string) {
    const payload = new FormData();
    const encryptedPAN = encryptText(panNumber);
    payload.append('panNumber', encryptedPAN);
    return this.http.post(this.panExistURL, payload);
  }

  getCurrentDate() {
    return this.http.get<CurrentDate>(this.currentDateURL);
  }

  viewAnimalTranactions(animalId: string) {
    let payload = { animalId: animalId };
    return this.http.post<AnimalTransactions[]>(
      this.viewAnimalTransactionsURL,
      payload
    );
  }

  getDetailsByTagID(id: string, villageCd?: string) {
    let payload = new FormData();
    if (villageCd) {
      payload.append('ownerAddressCityVillageCd', villageCd);
      payload.append('TagId', id);
    } else {
      payload.append('TagId', id);
    }

    return this.http.post<AnimalResult>(this.getDetailsByTagIdURL, payload);
  }

  fetchLatestTagId(animalTagId: string) {
    let payload = new FormData();
    payload.append('oldTag', animalTagId);
    return this.http.post<LatestTags>(this.latestTagURL, payload);
  }

  getAdditionalDetails() {
    return this.isAnimalAdditionalDetails;
  }

  setAdditionalDetails(value: boolean) {
    this.isAnimalAdditionalDetails = value;
  }

  getConfigDataForAnimalMgmt(payload: Array<string>) {
    return this.http
      .post(this.getAnimalMgmtConfigURL, payload)
      .pipe(shareReplay(1));
  }
  getEditAnimal() {
    return this.isAnimalEdited;
  }

  setEditAnimal(value: boolean) {
    this.isAnimalEdited = value;
  }

  getSireSireId(id: string, resType?: string) {
    const body = {
      inputMapping: [
        {
          key: resType || 1,
          value: id,
        },
      ],
      responseType: '20',
    };
    return this.http.post(this.getDamSireIdFromDamIdURL, body);
  }
}
