import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditRoundMasterComponent } from './edit-round-master/edit-round-master.component';
import { RoundMasterComponent } from './round-master.component';

const routes: Routes = [
  { path: "", component: RoundMasterComponent},
  { path: "edit-roundMaster", component: EditRoundMasterComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoundMasterRoutingModule { }
