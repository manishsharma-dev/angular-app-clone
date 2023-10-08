import { ModifyOwnerDetailsComponent } from './modify-owner-details/modify-owner-details.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerDetailsComponent } from './owner-details/owner-details.component';
import { OwnerTransferComponent } from './owner-transfer/owner-transfer.component';
import { ModifyOwnerDetailsVillageWiseComponent } from './modify-owner-details-villagewise/modify-owner-details.component';

const routes: Routes = [
  { path: 'ownersearch', component: OwnerDetailsComponent },
  { path: 'ownertransfer', component: OwnerTransferComponent },
  { path: 'modifyowner', component: ModifyOwnerDetailsComponent },
  {
    path: 'ownersearchinvillage',
    component: ModifyOwnerDetailsVillageWiseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OwnerRoutingModule {}
