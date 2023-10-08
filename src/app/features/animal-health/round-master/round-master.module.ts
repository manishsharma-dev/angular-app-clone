import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoundMasterRoutingModule } from './round-master-routing.module';
import { RoundMasterComponent } from './round-master.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditRoundMasterComponent } from './edit-round-master/edit-round-master.component';
import { ViewRoundMasterComponent } from './view-round-master/view-round-master.component';
import { RoundDialogComponent } from './round-dialog/round-dialog.component';


@NgModule({
  declarations: [
    RoundMasterComponent,
    EditRoundMasterComponent,
    ViewRoundMasterComponent,
    RoundDialogComponent
    
  ],
  imports: [
    CommonModule,
    RoundMasterRoutingModule,
    SharedModule
  ]
})
export class RoundMasterModule { }
