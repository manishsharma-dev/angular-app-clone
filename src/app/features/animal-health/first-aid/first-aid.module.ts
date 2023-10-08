import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FirstAidRoutingModule } from './first-aid-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FirstAidComponent } from './first-aid.component';
import { AddFirstAidComponent } from './add-first-aid/add-first-aid.component';
import { CaseIDDialogComponent } from './case-id-dialog/case-id-dialog.component';


@NgModule({
  declarations: [
    FirstAidComponent,
    AddFirstAidComponent,
    CaseIDDialogComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    FirstAidRoutingModule
  ]
})
export class FirstAidModule { }
