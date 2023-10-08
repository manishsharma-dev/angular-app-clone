import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnimalDetailComponent } from './list/animal-detail.component';

const routes: Routes = [
  { path: "", component: AnimalDetailComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnimalDetailsRoutingModule { }
