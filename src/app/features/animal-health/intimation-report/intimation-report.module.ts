import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntimationReportRoutingModule } from './intimation-report-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { IntimationReportComponent } from './intimation-report.component';
import { IntimationSubmitDialogComponent } from './intimation-submit-dialog/intimation-submit-dialog.component';
import { IntimationReportListComponent } from './intimation-report-list/intimation-report-list.component';
import { ViewIntimationReportComponent } from './view-intimation-report/view-intimation-report.component';


@NgModule({
  declarations: [
    IntimationReportComponent,
    IntimationSubmitDialogComponent,
    IntimationReportListComponent,
    ViewIntimationReportComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    IntimationReportRoutingModule
  ]
})
export class IntimationReportModule { }
