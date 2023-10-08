import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddDetailsDialogComponent } from './add-details-dialog.component';

const routes: Routes = [
  {path:'', component: AddDetailsDialogComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddDetailsDialogRoutingModule { }
