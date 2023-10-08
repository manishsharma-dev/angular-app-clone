import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BreedingValueEstimationComponent } from './breeding-value-estimation.component';

const routes: Routes = [
  {
    path: '',
    component: BreedingValueEstimationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BreedingValueEstimationRoutingModule {}
