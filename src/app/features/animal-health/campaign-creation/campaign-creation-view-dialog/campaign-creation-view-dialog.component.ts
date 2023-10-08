import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CampaignCreationService } from '../campaign-creation.service';
import { HealthService } from '../../health.service';
import { ViewCampaign } from '../models/viewCampaign.model';

@Component({
  selector: 'app-campaign-creation-view-dialog',
  templateUrl: './campaign-creation-view-dialog.component.html',
  styleUrls: ['./campaign-creation-view-dialog.component.css'],
})
export class CampaignCreationViewDialogComponent implements OnInit {
  step = 0;
  isLoadingSpinner = false;
  prescriptionRes!: ViewCampaign;
  newStringvillageName: string;
  newStringtehsilName: string;
  newStringdistrictName: string;
  vaccinationRes = false;
  dewormingRes = false;
  treatmentRes = false;
  searchText:string;
  searchTextDeworming:string;
  searchTextFertility: string;

  constructor(
    private camCreationService: CampaignCreationService,
    @Inject(MAT_DIALOG_DATA)
    public data: { campaignId: number; campaignType: number },
    private healthService: HealthService
  ) {}

  ngOnInit(): void {
    if (this.data.campaignType == 1) {
      this.vaccinationRes = true;
      this.dewormingRes = false;
      this.treatmentRes = false;
    } else if (this.data.campaignType == 2) {
      this.dewormingRes = true;
      this.vaccinationRes = false;
      this.treatmentRes = false;
    } else if (this.data.campaignType == 4  || this.data.campaignType  == 3) {
      this.treatmentRes = true;
      this.dewormingRes = false;
      this.vaccinationRes = false;
    } else {
      this.dewormingRes = false;
      this.treatmentRes = false;
    }
    this.viewReports();
  }
  setStep(step: number) {
    this.step = step;
  }

  viewReports() {
    this.isLoadingSpinner = true;

    this.camCreationService
      .viewCampaignCreation(this.data.campaignId, this.data.campaignType)
      .subscribe((res) => {
        if (this.healthService.isErrorResponse(res)) {
          return;
        }
        this.isLoadingSpinner = false;
        this.prescriptionRes = res;
        let array = res.locationDetailsResponseDto;
        const ids = array.map((obj) => obj.villageName).join(',');
        this.newStringvillageName = ids;
        const ids2 = array.map((obj) => obj.tehsilName).join(',');
        this.newStringtehsilName = ids2;
        const ids3 = array.map((obj) => obj.districtName).join(',');
        this.newStringdistrictName = ids3;
      });
  }
}
