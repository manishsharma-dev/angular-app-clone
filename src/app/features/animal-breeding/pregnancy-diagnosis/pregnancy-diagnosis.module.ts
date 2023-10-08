import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PregnancyDiagnosisRoutingModule } from './pregnancy-diagnosis-routing.module';
import { PregnancyDiagnosisComponent } from './pregnancy-diagnosis/pregnancy-diagnosis.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NewpdComponent } from './newpd/newpd.component';
import { PdHistoryComponent } from './pd-history/pd-history.component';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';




@NgModule({
  declarations: [
    PregnancyDiagnosisComponent,
    NewpdComponent,
    PdHistoryComponent,
    SaveDialogComponent
  ],
  imports: [
    CommonModule,
    PregnancyDiagnosisRoutingModule,
    SharedModule
  ],
  providers : [DatePipe,{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class PregnancyDiagnosisModule { }
