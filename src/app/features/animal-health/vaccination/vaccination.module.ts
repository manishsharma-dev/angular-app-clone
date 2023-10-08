import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { VaccinationRoutingModule } from './vaccination-routing.module';
import { VaccinationComponent } from './vaccination.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CampaignDetailComponent } from './campaign-detail/campaign-detail.component';
import { VaccinationDialogComponent } from './vaccination-dialog/vaccination-dialog.component';
import { WithoutCampaignDialogComponent } from './without-campaign-dialog/without-campaign-dialog.component';
import { ViewMoreVaccinationComponent } from './view-more-vaccination/view-more-vaccination.component';
import { WithoutCampDetailsComponent } from './without-camp-details/without-camp-details.component';
import { OnSearchDetailsComponent } from './on-search-details/on-search-details.component';

@NgModule({
  declarations: [
    VaccinationComponent,
    CampaignDetailComponent,
    VaccinationDialogComponent,
    WithoutCampaignDialogComponent,
    ViewMoreVaccinationComponent,
    WithoutCampDetailsComponent,
    OnSearchDetailsComponent,
  ],
  imports: [
    CommonModule,
    VaccinationRoutingModule,
    SharedModule
  ],
})
export class VaccinationModule { }
