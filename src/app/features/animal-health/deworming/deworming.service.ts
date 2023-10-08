import { CommonRes } from './../models/common-res.model';
import { Species } from './../vaccination/models/ownerDetails.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Medicine } from '../animal-treatment/models/master.model';
import { AnimalListWithout } from '../vaccination/models/animal.model';
import { CampaignList } from '../vaccination/models/campaign-list.model';
import { EligibleAnimal } from '../vaccination/models/campaign-village.model';
import { Animal } from './models/animal.model';
import { CampaignVillages } from './models/campaign-village.model';
import { Campaign } from './models/campaign.model';
import { Config } from './models/config.model';
import { DewormingDetails } from './models/deworming-details.model';
import { SaveDeworming, SelectedTagIDDetail } from './models/subimt-dewo.model';

const BACKEND_URL = environment.apiURL + 'animalhealth';
const COMMON_URL = environment.apiURL;
const AnimalMgmt_URL = environment.apiURL;

@Injectable({
  providedIn: 'root',
})
export class DewormingService {
  // private newUser = new BehaviorSubject<{ tagId: number }[]>([]);

  constructor(private http: HttpClient) { }

  // setNewUserInfo(user: { tagId: number }[]) {
  //   this.newUser.next(user);
  // }
  // getUserInfo() {
  //   return this.newUser as Observable<{ tagId: number }[]>;
  // }

  getCampaignList(campaignType: number) {
    return this.http.post<Campaign[]>(BACKEND_URL + '/getCampaignList', {
      campaignType,
    });
  }

  getVillagesByCampaign(campaignId: number) {
    return this.http.post<{
      villageCount: number;
      villageDetails: CampaignVillages[];
    }>(BACKEND_URL + '/getVillagesByCampaign', { campaignId });
  }

  getAnimalList(sendingdata) {
    return this.http.post<Animal[]>(
      BACKEND_URL + '/getAnimalList',
      sendingdata
    );
  }

  getVaccinationOrDewarmerDetail(
    animalIdList: { tagId: number; ownerId: number; animalId: number }[],
    medicineCd
  ) {
    return this.http.post<DewormingDetails[]>(
      BACKEND_URL + '/getVaccinationOrDewarmerDetail',
      { animalIdList, vaccinationDewormingFlag: 'D', medicineCd }
    );
  }

  getSelectedCampaignDetails(list: CampaignList) {
    return this.http.post<Campaign>(
      BACKEND_URL + '/getSelectedCampaignDetails',
      list
    );
  }

  public getWithoutCampaignAnimalList(
    villageCd: number,
    speciesCd,
    vaccinationDewormingFlag: string,
    text?: string,
    ownerType?: number
  ) {
    return this.http.post<AnimalListWithout[]>(
      BACKEND_URL + '/getWithoutCampaignAnimalList',
      { villageCd, speciesCd, vaccinationDewormingFlag, text, ownerType }
    );
  }
  saveDewormingDetails(details: SaveDeworming) {
    return this.http.post<{
      errorCode: number;
      status: string;
    }>(BACKEND_URL + '/saveDewormingDetail', details);
  }

  getDefualtConfig(key: string) {
    return this.http.post<Config>(
      COMMON_URL + 'commonutility/getConfigDetail',
      {
        key,
      }
    );
  }

  getTotalAnimalCount(sendingdata) {
    return this.http.post<EligibleAnimal>(
      BACKEND_URL + '/getTotalAnimalCount',
      sendingdata
    );
  }

  getEligibleDewormerCount(
    campaignId: number,
    campaignType: number,
    villageCd: number
    // vaccineCd: number
  ) {
    return this.http.post<{ dewormerAnimalCount: number }>(
      BACKEND_URL + '/getEligibleDewormerCount',
      {
        campaignId,
        campaignType,
        villageCd,
        // vaccineCd,
      }
    );
  }
}
