import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddFirstAidComponent } from './add-first-aid/add-first-aid.component';
import { FirstAidComponent } from './first-aid.component';

const routes: Routes = [
  { path: "", component: FirstAidComponent},
  { path: "add-first-aid/:animalId", component: AddFirstAidComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FirstAidRoutingModule { }
