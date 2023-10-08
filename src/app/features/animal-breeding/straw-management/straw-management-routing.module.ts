import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditStrawComponent } from './add-edit-straw/add-edit-straw.component';
import { StrawListingComponent } from './straw-listing/straw-listing.component';

const routes: Routes = [
  { path: '', component: StrawListingComponent },
  { path: 'add-edit-semen-straw', component: AddEditStrawComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StrawManagementRoutingModule { }
