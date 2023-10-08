import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignCreationRoutingModule } from './campaign-creation-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CampaignCreationEditDialogComponent } from './campaign-creation-edit-dialog/campaign-creation-edit-dialog.component';
import { CampaignCreationViewDialogComponent } from './campaign-creation-view-dialog/campaign-creation-view-dialog.component';
import { CampaignCreationComponent } from './campaign-creation.component';
import { CampaignCreationDialogComponent } from './campaign-creation-dialog/campaign-creation-dialog.component';
import { LocationMappingViewComponent } from './location-mapping-view/location-mapping-view.component';
import { LocationMappingEditComponent } from './location-mapping-edit/location-mapping-edit.component';


@NgModule({
  declarations: [
    CampaignCreationComponent,
    CampaignCreationDialogComponent,
    CampaignCreationViewDialogComponent,
    CampaignCreationEditDialogComponent,
    LocationMappingViewComponent,
    LocationMappingEditComponent],

  imports: [
    CommonModule,
    SharedModule,
    CampaignCreationRoutingModule
  ],
})
export class CampaignCreationModule { }
