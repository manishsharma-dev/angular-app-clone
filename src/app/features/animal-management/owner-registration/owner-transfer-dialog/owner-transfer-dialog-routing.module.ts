import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerTransferDialogComponent } from './owner-transfer-dialog.component';

const routes: Routes = [{ path: '', component: OwnerTransferDialogComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OwnerTransferDialogRoutingModule {}