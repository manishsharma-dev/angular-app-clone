import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DewormingRoutingModule } from './deworming-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DewormingComponent } from './deworming.component';
import { DewormingDialogComponent } from './deworming-dialog/deworming-dialog.component';
import { DewormingDetailsComponent } from './deworming-details/deworming-details.component';
import { ViewMoreDialogComponent } from './view-more-dialog/view-more-dialog.component';





@NgModule({
  declarations: [
    DewormingComponent,
    DewormingDialogComponent,
    DewormingDetailsComponent,
    ViewMoreDialogComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    DewormingRoutingModule
  ]
})
export class DewormingModule { }
