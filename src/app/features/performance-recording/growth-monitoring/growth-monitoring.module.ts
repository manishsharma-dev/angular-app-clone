import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GrowthMonitoringRoutingModule } from './growth-monitoring-routing.module';
import { GrowthMonitoringComponent } from './growth-monitoring.component';
import { NewGmComponent } from './new-gm/new-gm.component';
import { GmHistoryComponent } from './gm-history/gm-history.component';
import { GmSuccessDialogComponent } from './gm-success-dialog/gm-success-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    GrowthMonitoringComponent,
    NewGmComponent,
    GmHistoryComponent,
    GmSuccessDialogComponent,
  ],
  imports: [CommonModule, GrowthMonitoringRoutingModule, SharedModule],
})
export class GrowthMonitoringModule {}
