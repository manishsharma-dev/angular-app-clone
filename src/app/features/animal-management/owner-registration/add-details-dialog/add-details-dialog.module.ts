import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDetailsDialogRoutingModule } from './add-details-dialog-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    AddDetailsDialogRoutingModule
  ]
})
export class AddDetailsDialogModule { }
