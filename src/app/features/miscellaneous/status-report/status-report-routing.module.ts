import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusReportComponent } from './status-report.component';

const routes: Routes = [
  { path: "", component: StatusReportComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatusReportRoutingModule { }
