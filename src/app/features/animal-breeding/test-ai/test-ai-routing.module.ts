import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTestPlanComponent } from './create-test-plan/create-test-plan.component';
import { TestAIListComponent } from './test-ailist/test-ailist.component';

const routes: Routes = [
  { path: '', component: TestAIListComponent },
  { path: 'create-test-plan', component: CreateTestPlanComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestAIRoutingModule {}
