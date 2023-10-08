import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GmHistoryComponent } from './gm-history/gm-history.component';
import { GrowthMonitoringComponent } from './growth-monitoring.component';
import { NewGmComponent } from './new-gm/new-gm.component';

const routes: Routes = [
  { path: '', component: GrowthMonitoringComponent },
  { path: 'new-gm', component: NewGmComponent },
  { path: 'view-history', component: GmHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrowthMonitoringRoutingModule {}
