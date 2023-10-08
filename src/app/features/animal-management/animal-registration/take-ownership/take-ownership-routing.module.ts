import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TakeOwnershipComponent } from './take-ownership.component';

const routes: Routes = [
  { path: "", component: TakeOwnershipComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TakeOwnershipRoutingModule {}
