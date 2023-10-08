import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditAnimalComponent } from './edit-animal.component';

const routes: Routes = [
  { path: "", component: EditAnimalComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditAnimalRoutingModule { }