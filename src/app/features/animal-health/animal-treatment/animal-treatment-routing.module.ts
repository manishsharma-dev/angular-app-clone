import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterConfig } from 'src/app/shared/master.config';
import { AnimalTreatmentComponent } from '../animal-treatment/animal-treatment.component';
import { FollowUpComponent } from './follow-up/follow-up.component';
import { NewCaseComponent } from './new-case/new-case.component';

const routes: Routes = [
  { path: '', component: AnimalTreatmentComponent },
  { path: 'newcase', component: NewCaseComponent, data: { permissionType: MasterConfig.isAdd } },
  { path: 'updatecase', component: NewCaseComponent, data: { permissionType: MasterConfig.isModify } },
  { path: 'follow-up/:animalId', component: FollowUpComponent, data: { permissionType: MasterConfig.isView } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnimalTreatmentRoutingModule { }
