import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SaveCamCreation } from './models/camCreation.model';
import { EditCampaign } from './models/editCampaign.model';
import { SpeciesData } from './models/species.model';
import { GetProjectDetails } from './models/getProjectDetails.model';


const BACKEND_URL = environment.apiURL + 'animalhealth';
const COMMON_URL = environment.apiURL;

@Injectable({
  providedIn: 'root'
})
export class CampaignCreationService {

  constructor(private httpClient: HttpClient) { }


  public campaignList() {
    return this.httpClient.get<any>(BACKEND_URL + '/getAllCampaigns')
  }

  viewCampaignCreation(campaignId: number, campaignType: number) {
    return this.httpClient.post<any>(BACKEND_URL + '/viewCampaignDetails',
      {
        campaignId,
        campaignType,
      }
    );
  }
  public campaignCreation(camCreation: SaveCamCreation) {
    return this.httpClient.post<any>(BACKEND_URL + '/saveCampaignDetail', camCreation)
  }
  public campaignType(key: string) {
    return this.httpClient.post<any>(COMMON_URL + 'commonutility/getCommonMaster', { key })
  }
  // public projectType(key:string){
  //   return this.httpClient.post<any>(COMMON_URL + 'commonutility/getCommonMaster', {key})
  // }

  projectType(id?: string) {
    var payload = new FormData();
    payload.append('userId', JSON.parse(sessionStorage.getItem('user'))?.userId,);
    return this.httpClient.post<any>(COMMON_URL + "admin/user/getUserDetails", payload);
  }
  public campaignStatus(key: string) {
    return this.httpClient.post<any>(COMMON_URL + 'commonutility/getCommonMaster', { key })
  }
  public editCampaign(editCamp: EditCampaign) {
    return this.httpClient.post<any>(BACKEND_URL + '/updateCampaign', editCamp)
  }

  public getSpecies(data) {
    return this.httpClient.post<SpeciesData[]>(BACKEND_URL + '/getRouteFormUnitDoseSpecies', data)
  }

  public getProjectDetails(data) {
    let payload = {
      projectId: data
    }
    return this.httpClient.post<GetProjectDetails[]>(COMMON_URL + 'admin/project/getProjectDetails', payload)
  }
}



