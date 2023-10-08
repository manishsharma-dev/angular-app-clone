import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupDiseaseTestingComponent } from './group-disease-testing.component';
import { NewGroupTestComponent } from './new-group-test/new-group-test.component';
import { NewPoolTestComponent } from './new-pool-test/new-pool-test.component';
import { PreviousResultsComponent } from './previous-results/previous-results.component';

const routes: Routes = [
  {
    path: '',
    component: GroupDiseaseTestingComponent
  },
  {
    path: 'new-group-test',
    component: NewGroupTestComponent
  },
  {
    path: 'new-pool-test',
    component: NewPoolTestComponent
  }, {
    path: 'previous-disease-testing-results',
    component: PreviousResultsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsDiseaseTestingRoutingModule { }
