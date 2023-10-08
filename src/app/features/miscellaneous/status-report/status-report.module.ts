import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatusReportRoutingModule } from './status-report-routing.module';
import { StatusReportComponent } from './status-report.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AnimalReportDialogComponent } from './animal-report-dialog/animal-report-dialog.component';


@NgModule({
  declarations: [
    StatusReportComponent,
    AnimalReportDialogComponent
  ],
  imports: [
    CommonModule,
    StatusReportRoutingModule,
    SharedModule
  ]
})
export class StatusReportModule { }
