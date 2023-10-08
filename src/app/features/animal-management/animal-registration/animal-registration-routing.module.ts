import { TakeOwnershipComponent } from './take-ownership/take-ownership.component';
import { ModifyAnimalDetailsComponent } from './modify-animal-details/modify-animal-details.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAnimalComponent } from './add-animal/add-animal.component';
import { AnimalDashComponent } from './animal-dash/animal-dash.component';
import { AnimalDetailComponent } from './animal-details/list/animal-detail.component';
import { EarTagChangeComponent } from './ear-tag-change/ear-tag-change.component';
import { EditAnimalComponent } from './edit-animal/edit-animal.component';
import { LatestAnimalTagComponent } from './latest-animal-tag/latest-animal-tag.component';

const routes: Routes = [
  { path: 'animaldash', component: AnimalDashComponent },
  { path: 'animalsearch', component: AddAnimalComponent },
  { path: 'addanimal', component: AnimalDetailComponent },
  { path: 'eartagchange', component: EarTagChangeComponent },
  { path: 'editanimal', component: EditAnimalComponent },
  { path: 'modifyanimal', component: ModifyAnimalDetailsComponent },
  { path: 'takeownership', component: TakeOwnershipComponent },
  { path: 'latesttag', component: LatestAnimalTagComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnimalRoutingModule {}
