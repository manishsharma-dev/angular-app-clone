import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerTransferRoutingModule } from './owner-transfer-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    OwnerTransferRoutingModule
  ]
})
export class OwnerTransferModule { }