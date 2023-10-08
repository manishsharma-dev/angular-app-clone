import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddInfoDialogRoutingModule } from './add-info-dialog-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    AddInfoDialogRoutingModule
  ]
})
export class AddInfoDialogModule { }
