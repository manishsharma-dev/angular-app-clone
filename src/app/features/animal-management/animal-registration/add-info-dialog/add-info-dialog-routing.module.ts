import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddInfoDialogComponent } from './add-info-dialog.component';

const routes: Routes = [
  { path: "", component: AddInfoDialogComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddInfoDialogRoutingModule { }