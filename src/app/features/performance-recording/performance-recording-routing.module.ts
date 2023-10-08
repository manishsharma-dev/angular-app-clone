import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'milk-recording',
    loadChildren: () =>
      import('./milk-recording/milk-recording.module').then(
        (m) => m.MilkRecordingModule
      ),
  },
  {
    path: 'milk-sampling',
    loadChildren: () =>
      import('./milk-sampling/milk-sampling.module').then(
        (m) => m.MilkSamplingModule
      ),
  },
  {
    path: 'mr-schedule',
    loadChildren: () =>
      import('./mr-schedule/mr-schedule.module').then(
        (m) => m.MRScheduleModule
      ),
  },
  {
    path: 'growth-monitoring',
    loadChildren: () =>
      import('./growth-monitoring/growth-monitoring.module').then(
        (m) => m.GrowthMonitoringModule
      ),
  },
  {
    path: 'typing',
    loadChildren: () =>
      import('./typing/typing.module').then((m) => m.TypingModule),
  },
  {
    path: 'genetic-analysis',
    loadChildren: () =>
      import('./genetic-analysis/genetic-analysis.module').then(
        (m) => m.GeneticAnalysisModule
      ),
  },
  {
    path: 'generate-sample-ids',
    loadChildren: () =>
      import('./generate-sample-ids/generate-sample-ids.module').then(
        (m) => m.GenerateSampleIdsModule
      ),
  },
  {
    path: 'dry-off',
    loadChildren: () =>
      import('./dry-off/dry-off.module').then((m) => m.DryOffModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceRecordingRoutingModule {}
