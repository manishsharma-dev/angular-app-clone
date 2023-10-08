import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerTransferDetailsEditComponent } from './owner-transfer-details-edit.component';

const routes: Routes = [
  { path: "", component: OwnerTransferDetailsEditComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerTransferDetailsEditRoutingModule { }