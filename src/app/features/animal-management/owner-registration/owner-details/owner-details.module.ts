import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerDetailsRoutingModule } from './owner-details-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    OwnerDetailsRoutingModule
  ]
})
export class OwnerDetailsModule { }