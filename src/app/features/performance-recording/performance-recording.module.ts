import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PerformanceRecordingRoutingModule } from './performance-recording-routing.module';
import { SampleDetailsComponent } from './components/sample-details/sample-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BreedingUpdateSamplesComponent } from './components/breeding-update-samples/breeding-update-samples.component';
import { PreviewDialogComponent } from './components/preview-dialog/preview-dialog.component';

@NgModule({
  declarations: [
    SampleDetailsComponent,
    BreedingUpdateSamplesComponent,
    PreviewDialogComponent,
  ],
  imports: [CommonModule, SharedModule, PerformanceRecordingRoutingModule],
  exports: [SampleDetailsComponent],
})
export class PerformanceRecordingModule {}
