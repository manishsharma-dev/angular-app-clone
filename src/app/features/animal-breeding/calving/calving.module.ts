import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { CalvingRoutingModule } from './calving-routing.module';
import { CalvingComponent } from './calving/calving.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalvingHistoryComponent } from './calving-history/calving-history.component';
import { NewCalvingComponent } from './new-calving/new-calving.component';
import { CalvingStatusDialogComponent } from './calving-status-dialog/calving-status-dialog.component';
import { VerifyAdditionalDetailsComponent } from './verify-additional-details/verify-additional-details.component';


@NgModule({
  declarations: [
    CalvingComponent,
    CalvingHistoryComponent,
    NewCalvingComponent,
    CalvingStatusDialogComponent,
    VerifyAdditionalDetailsComponent
  ],
  imports: [
    CommonModule,
    CalvingRoutingModule,
    SharedModule
  ],
  providers : [DatePipe,{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class CalvingModule { }
