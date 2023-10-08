import { IntimationReportListComponent } from './intimation-report-list/intimation-report-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntimationReportComponent } from './intimation-report.component';

const routes: Routes = [
  { path: '', component: IntimationReportListComponent },
  { path: 'new-report', component: IntimationReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntimationReportRoutingModule {}
