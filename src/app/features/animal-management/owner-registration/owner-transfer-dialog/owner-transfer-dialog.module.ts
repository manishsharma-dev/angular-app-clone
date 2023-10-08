import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerTransferDialogRoutingModule } from './owner-transfer-dialog-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    OwnerTransferDialogRoutingModule
  ]
})
export class OwnerTransferDialogModule { }