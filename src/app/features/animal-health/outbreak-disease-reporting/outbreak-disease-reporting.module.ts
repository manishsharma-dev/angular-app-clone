import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OutbreakDiseaseReportingRoutingModule } from './outbreak-disease-reporting-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { OutbreakDiseaseReportingComponent } from './outbreak-disease-reporting.component';
import { OutbreakFollowUpComponent } from './outbreak-follow-up/outbreak-follow-up.component';
import { InterimReportComponent } from './interim-report/interim-report.component';
import { UpdateResultComponent } from './update-result/update-result.component';
import { FinalReportComponent } from './final-report/final-report.component';
import { SubmitFollowUpComponent } from './submit-follow-up/submit-follow-up.component';


@NgModule({
  declarations: [
    OutbreakDiseaseReportingComponent,
    OutbreakFollowUpComponent,
    InterimReportComponent,
    UpdateResultComponent,
    FinalReportComponent,
    SubmitFollowUpComponent
  ],
  imports: [
    CommonModule,
    OutbreakDiseaseReportingRoutingModule,
    SharedModule
  ]
})
export class OutbreakDiseaseReportingModule { }
