import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BullMasterRoutingModule } from './bull-master-routing.module';
import { BullMasterListComponent } from './bull-master-list/bull-master-list.component';
import { AddEditBullMasterComponent } from './add-edit-bull-master/add-edit-bull-master.component';
import { ViewBullMasterDetailComponent } from './view-bull-master-detail/view-bull-master-detail.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdditionalAnimalDetailComponent } from './additional-animal-detail/additional-animal-detail.component';
import { AdditionalDetailsDialogComponent } from './additional-details-dialog/additional-details-dialog.component';
import { DamDetailsComponent } from './additional-details-dialog/dam-details/dam-details.component';
import { SireDetailsComponent } from './additional-details-dialog/sire-details/sire-details.component';
import { DateSectionComponent } from './additional-details-dialog/date-section/date-section.component';


@NgModule({
  declarations: [
    BullMasterListComponent,
    AddEditBullMasterComponent,
    ViewBullMasterDetailComponent,
    AdditionalAnimalDetailComponent,
    AdditionalDetailsDialogComponent,
    DamDetailsComponent,
    SireDetailsComponent,
    DateSectionComponent
  ],
  imports: [
    CommonModule,
    BullMasterRoutingModule,
    SharedModule
  ]
})
export class BullMasterModule { }
