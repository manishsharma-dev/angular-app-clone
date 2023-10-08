import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActionFormComponent } from './action-form/action-form.component';
import { WorklistComponent } from './worklist.component';

const routes: Routes = [
  { path: "", component: WorklistComponent},
  { path: "action-form", component: ActionFormComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorklistRoutingModule { }
