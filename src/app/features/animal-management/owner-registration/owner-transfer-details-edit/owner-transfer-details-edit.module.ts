import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerTransferDetailsEditRoutingModule } from './owner-transfer-details-edit-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    OwnerTransferDetailsEditRoutingModule,
  ],entryComponents: [
  ],
})
export class OwnerTransferDetailsEditModule { }