import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewWorkListComponent } from './view-worklist.component';

const routes: Routes = [
  // { path: "", component: ViewWorkListComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewWorkListRoutingModule { }