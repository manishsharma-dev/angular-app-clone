import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusReportComponent } from './status-report/status-report.component';

const routes: Routes = [
  {
    path: 'status-report',
    loadChildren: () =>
      import('./status-report/status-report.module').then(
        (m) => m.StatusReportModule
      ),
  },
    {
    path: 'user-activity-report',
    loadChildren: () =>
      import('./user-activity-report/user-activity-report.module').then(
        (m) => m.UserActivityReportModule
      ),
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiscellaneousRoutingModule {}
