import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MilkRecordingRoutingModule } from './milk-recording-routing.module';
import { AddMRComponent } from './add-mr/add-mr.component';
import { PreviousMRComponent } from './previous-mr/previous-mr.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddMilkRecordingComponent } from './add-mr/add-milk-recording/add-milk-recording.component';
import { StopRecordingDialougComponent } from './stop-recording-dialoug/stop-recording-dialoug.component';
import { BreedingHistoryComponent } from './breeding-history/breeding-history.component';
import { AddPreviousMRComponent } from './previous-mr/add-previous-mr/add-previous-mr.component';
import { MrSubmitDialogComponent } from './mr-submit-dialog/mr-submit-dialog.component';
import { UpdateCalvingDateDialogComponent } from './update-calving-date-dialog/update-calving-date-dialog.component';


@NgModule({
  declarations: [
    AddMRComponent,
    PreviousMRComponent,
    AddMilkRecordingComponent,
    StopRecordingDialougComponent,
    BreedingHistoryComponent,
    AddPreviousMRComponent,
    MrSubmitDialogComponent,
    UpdateCalvingDateDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MilkRecordingRoutingModule
  ]
})
export class MilkRecordingModule { }
