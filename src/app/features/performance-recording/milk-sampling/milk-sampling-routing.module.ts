import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMilkSampleComponent } from './add-milk-sample/add-milk-sample.component';
import { MilkSampleListComponent } from './milk-sample-list/milk-sample-list.component';

const routes: Routes = [
  { path: 'sample-list', component: MilkSampleListComponent },
  { path: 'add-sample', component: AddMilkSampleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MilkSamplingRoutingModule {}
