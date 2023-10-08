import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserActivityReportComponent } from './user-activity-report.component';

const routes: Routes = [
  { path: "", component: UserActivityReportComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserActivityReportRoutingModule { }
