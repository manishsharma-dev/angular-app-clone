import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerTransferComponent } from './owner-transfer.component';

const routes: Routes = [
  { path: "", component: OwnerTransferComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerTransferRoutingModule { }