import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirDetailsFormComponent } from './fir-details-form/fir-details-form.component';
import { FIRComponent } from './fir.component';

const routes: Routes = [
  { path: "", component: FIRComponent},
  { path: "fir-details-form", component: FirDetailsFormComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIRRoutingModule { }
