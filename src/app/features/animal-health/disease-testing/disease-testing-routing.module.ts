import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiseaseTestingComponent } from './disease-testing.component';
import { NewTestComponent } from './new-test/new-test.component';
import { PreviousTestingResultsComponent } from './previous-testing-results/previous-testing-results.component';

const routes: Routes = [
  {
    path: '',
    component: DiseaseTestingComponent,
  },
  {
    path: 'new-disease-test',
    component: NewTestComponent,
  },
  {
    path: 'previous-testing-results/:tagId',
    component: PreviousTestingResultsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiseaseTestingRoutingModule {}
