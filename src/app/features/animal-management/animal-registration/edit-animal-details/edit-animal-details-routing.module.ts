import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditAnimalDetailsComponent } from './edit-animal-details.component';

const routes: Routes = [
  { path: "", component: EditAnimalDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditAnimalDetailsRoutingModule { }