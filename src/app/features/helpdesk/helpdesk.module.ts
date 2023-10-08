import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpdeskRoutingModule } from './helpdesk-routing.module';
import { HelpdeskComponent } from './helpdesk/helpdesk.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    HelpdeskComponent
  ],
  imports: [
    CommonModule,
    HelpdeskRoutingModule,
    SharedModule
  ]
})
export class HelpdeskModule { }
