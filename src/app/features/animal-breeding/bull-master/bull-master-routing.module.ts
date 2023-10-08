import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditBullMasterComponent } from './add-edit-bull-master/add-edit-bull-master.component';
import { BullMasterListComponent } from './bull-master-list/bull-master-list.component';
import { ViewBullMasterDetailComponent } from './view-bull-master-detail/view-bull-master-detail.component';

const routes: Routes = [
  {path:'',component:BullMasterListComponent},
  {path:'add-bull',component:AddEditBullMasterComponent},
  {path:'view-bull-detail',component:ViewBullMasterDetailComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BullMasterRoutingModule { }
