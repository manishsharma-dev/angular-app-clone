import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DewormingDetailsComponent } from './deworming-details/deworming-details.component';
import { DewormingComponent } from './deworming.component';

const routes: Routes = [
  { path: "", component: DewormingComponent},
  { path: "details-list", component: DewormingDetailsComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DewormingRoutingModule { }
