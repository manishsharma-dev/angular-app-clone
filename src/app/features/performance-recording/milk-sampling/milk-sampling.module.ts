import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MilkSamplingRoutingModule } from './milk-sampling-routing.module';
import { MilkSampleListComponent } from './milk-sample-list/milk-sample-list.component';
import { AddMilkSampleComponent } from './add-milk-sample/add-milk-sample.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SampleReportComponent } from './sample-report/sample-report.component';
import { PerformanceRecordingModule } from '../performance-recording.module';
import { SampleTableComponent } from './sample-report/sample-table/sample-table.component';

@NgModule({
  declarations: [
    MilkSampleListComponent,
    AddMilkSampleComponent,
    SampleReportComponent,
    SampleTableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PerformanceRecordingModule,
    MilkSamplingRoutingModule,
  ],
})
export class MilkSamplingModule {}
