import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditOwnerDetailsRoutingModule } from './edit-owner-details-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    EditOwnerDetailsRoutingModule
  ]
})
export class EditOwnerDetailsModule { }