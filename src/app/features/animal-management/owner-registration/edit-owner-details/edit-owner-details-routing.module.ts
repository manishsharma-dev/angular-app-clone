import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditOwnerDetailsComponent } from './edit-owner-details.component';

const routes: Routes = [
  { path: "", component: EditOwnerDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditOwnerDetailsRoutingModule { }