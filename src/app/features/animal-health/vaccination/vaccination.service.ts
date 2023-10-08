import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Campaign } from './models/campaign.model';
import { CampaignVillages, EligibleAnimal, WithoutCamVillages } from './models/campaign-village.model';
import { Animal, AnimalListWithout } from './models/animal.model';
import { CampaignList } from './models/campaign-list.model';
import { VaccinationDetails } from './models/vacc-details.model';
import { SaveVaccination } from './models/submit-Vacc.model';
import { RepeatVaccReason, VaccinationName, VaccinationType, VaccType } from './models/vacc-Name.model';
import { WithoutVaccinationDate } from './models/vaccination-date.model';
import { UploadImageCampaign, UploadImageWithoutCampaign } from './models/uploadImage.model';
import { OwnerDetails } from './models/ownerDetails.model';
import { AnimalSearchResults } from './models/animalSearchResults.model';


const BACKEND_URL = environment.apiURL + 'animalhealth';
const COMMON_URL = environment.apiURL;
const AnimalMgmt_URL = environment.apiURL;

@Injectable({
  providedIn: 'root'
})
export class VaccinationService {


  constructor(private httpClient: HttpClient) { }

  private newUser = new BehaviorSubject<any>(null);
  private newUserWithoutCampaign = new BehaviorSubject<any>(null);
  private CampaignList = new BehaviorSubject<any>(null);

  // API Intregation for with Campaign Vaccination

  setNewUserInfo(user: any) {
    this.newUser.next(user);
  }
  getNewUserInfo() {
    return this.newUser.asObservable();
  }
  setNewUserInfoWithoutCampaign(user: any) {
    this.newUserWithoutCampaign.next(user);
  }

  getNewUserInfoWithoutCampaign() {
    return this.newUserWithoutCampaign.asObservable();
  }
  setCampaignListInfo(campaignId: number, campaignType: string) {
    this.CampaignList.next({ campaignId, campaignType });
  }

  getNewCampaignInfo() {
    return this.CampaignList.asObservable();
  }


  public getCampaignList(campaignType: number) {
    return this.httpClient.post<Campaign[]>(BACKEND_URL + '/getCampaignList', { campaignType })
  }

  getVillagesByCampaign(campaignId: number) {
    return this.httpClient.post<{
      villageCount: number;
      villageDetails: CampaignVillages[];
    }>(BACKEND_URL + '/getVillagesByCampaign', { campaignId });
  }

  public eligibleAnimalCountInVillage(sendingdata) {
    return this.httpClient.post<EligibleAnimal[]>(BACKEND_URL + '/getEligibleAnimalCountInVillage', sendingdata)
  }

  public totalAnimalCount(sendingdata) {
    return this.httpClient.post<EligibleAnimal[]>(BACKEND_URL + '/getTotalAnimalCount', sendingdata)
  }

  public totalVaccinatedAnimalCount(sendingdata) {
    return this.httpClient.post<EligibleAnimal[]>(BACKEND_URL + '/getTotalVaccinatedAnimalCount', sendingdata)
  }

  public vaccinatedAnimalCountInVillage(sendingdata) {
    return this.httpClient.post<EligibleAnimal[]>(BACKEND_URL + '/getVaccinatedAnimalCountInVillage', sendingdata)
  }
  public getAnimalList(sendingdata) {
    return this.httpClient.post<Animal[]>(BACKEND_URL + '/getAnimalList', sendingdata);
  }

  public getVaccinationOrDewarmerDetail(SendingData) {
    return this.httpClient.post<VaccinationDetails[]>(BACKEND_URL + '/getVaccinationOrDewarmerDetail', SendingData)
  }

  public getSelectedCampaignDetails(list: CampaignList) {
    return this.httpClient.post<CampaignList[]>(BACKEND_URL + '/getSelectedCampaignDetails', list)
  }

  public getVaccinationType(key: string) {
    return this.httpClient.post<VaccinationType[]>(COMMON_URL + 'commonutility/getCommonMaster', { key })
  }

  public getRepeatVaccinationReason(key: string) {
    return this.httpClient.post<RepeatVaccReason[]>(COMMON_URL + 'commonutility/getCommonMaster', { key })
  }

  public uploadImage(formdata) {

    return this.httpClient.post<UploadImageCampaign[]>(COMMON_URL + 'commonutility/uploadFile', formdata)
  }

  public saveVaccination(vaccination: SaveVaccination, minBoosterAllowed = false) {
    const request = { ...vaccination, minBoosterAllowed }
    return this.httpClient.post<any>(BACKEND_URL + '/saveVaccinationDetail', request)
  }


  // API Intregation for without Campaign Vaccination


  public getVaccinationFor() {
    return this.httpClient.get<any>(BACKEND_URL + '/getDiseaseList')
  }
  public getVaccinationName(diseaseCd: number) {
    return this.httpClient.post<VaccinationName[]>(BACKEND_URL + '/getVaccinationName', { diseaseCd })
  }

  public getVaccineTypeSubType(data) {
    return this.httpClient.post<VaccType[]>(BACKEND_URL + '/getVaccineTypeSubType', data)
  }

  public getWithoutCampaignAnimalList(data) {
    return this.httpClient.post<AnimalListWithout[]>(BACKEND_URL + '/getWithoutCampaignAnimalList', data)
  }

  public withoutCampaignVaccinationDetail(SendingData) {
    return this.httpClient.post<VaccinationDetails[]>(BACKEND_URL + '/getVaccinationOrDewarmerDetail', SendingData)
  }

  public withoutCampaignSaveVaccination(vaccination: SaveVaccination, minBoosterAllowed = false) {
    const request = { ...vaccination, minBoosterAllowed }
    return this.httpClient.post<any>(BACKEND_URL + '/saveVaccinationDetail', request)
  }
  public getWithoutVaccinationDate(key: string) {
    return this.httpClient.post<WithoutVaccinationDate[]>(COMMON_URL + 'commonutility/getConfigDetail', { key })
  }
  public uploadImageWithout(formdata) {

    return this.httpClient.post<UploadImageWithoutCampaign[]>(COMMON_URL + 'commonutility/uploadFile', formdata)
  }
  getOwnerByOwnerID(ownerID?: string, orgId?: string) {
    var payload = new FormData();
    if (ownerID) {
      payload.append('ownerId', ownerID);
    } else if (orgId) {
      payload.append('ownerId', orgId);
    }
    return this.httpClient.post<OwnerDetails>(AnimalMgmt_URL + 'animalmanagement/owner/getOwnerDetails', payload);
  }

  getDetailsByTagID(id: string) {
    var payload = new FormData();
    payload.append('TagId', id);
    return this.httpClient.post<AnimalSearchResults>(AnimalMgmt_URL + 'animalmanagement/animal/getAnimalDetailsByTagId', payload);
  }
}
