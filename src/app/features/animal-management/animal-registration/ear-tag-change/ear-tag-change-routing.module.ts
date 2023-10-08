import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EarTagChangeComponent } from './ear-tag-change.component';

const routes: Routes = [
  { path: "", component: EarTagChangeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EarTagChangeRoutingModule { }
