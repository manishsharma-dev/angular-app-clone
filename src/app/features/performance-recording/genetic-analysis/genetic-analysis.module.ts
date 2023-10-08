import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneticAnalysisRoutingModule } from './genetic-analysis-routing.module';
import { GeneticAnalysisComponent } from './genetic-analysis.component';
import { AddGeneticSampleComponent } from './add-genetic-sample/add-genetic-sample.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SaveGeneticDialogComponent } from './save-genetic-dialog/save-genetic-dialog.component';
import { PerformanceRecordingModule } from '../performance-recording.module';
import { GeneticReportComponent } from './genetic-report/genetic-report.component';
import { GeneticHistoryComponent } from './genetic-history/genetic-history.component';

@NgModule({
  declarations: [GeneticAnalysisComponent, AddGeneticSampleComponent, SaveGeneticDialogComponent, GeneticReportComponent, GeneticHistoryComponent],
  imports: [CommonModule, GeneticAnalysisRoutingModule, SharedModule, PerformanceRecordingModule],
})
export class GeneticAnalysisModule {}
