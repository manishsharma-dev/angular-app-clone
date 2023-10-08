import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DiseaseTestingRoutingModule } from './disease-testing-routing.module';
import { DiseaseTestingComponent } from './disease-testing.component';
import { SubmitDialogComponent } from './submit-dialog/submit-dialog.component';
import { PreviousTestingResultsComponent } from './previous-testing-results/previous-testing-results.component';
import { OnSpotResultDialogComponent } from './on-spot-result-dialog/on-spot-result-dialog.component';
import { ReportDialogComponent } from './report-dialog/report-dialog.component';
import { NewTestComponent } from './new-test/new-test.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AnimalHealthModule } from '../animal-health.module';
import { UpdateLabSampleComponent } from './update-lab-sample/update-lab-sample.component';

@NgModule({
  declarations: [
    DiseaseTestingComponent,
    SubmitDialogComponent,
    PreviousTestingResultsComponent,
    OnSpotResultDialogComponent,
    ReportDialogComponent,
    NewTestComponent,
    UpdateLabSampleComponent
  ],
  exports: [DiseaseTestingComponent,
    SubmitDialogComponent,
    PreviousTestingResultsComponent,
    OnSpotResultDialogComponent,
    ReportDialogComponent,
    NewTestComponent],
  imports: [CommonModule, DiseaseTestingRoutingModule, SharedModule, AnimalHealthModule],
  providers: [DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class DiseaseTestingModule { }
