import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewWorkListRoutingModule } from './view-worklist-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    ViewWorkListRoutingModule
  ]
})
export class ViewWorkListModule { }