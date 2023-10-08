import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserActivityReportRoutingModule } from './user-activity-report-routing.module';
import { UserActivityReportComponent } from './user-activity-report.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserReportDialogComponent } from './user-report-dialog/user-report-dialog.component';


@NgModule({
  declarations: [
    UserActivityReportComponent,
    UserReportDialogComponent
  ],
  imports: [
    CommonModule,
    UserActivityReportRoutingModule,
    SharedModule
  ]
})
export class UserActivityReportModule { }
