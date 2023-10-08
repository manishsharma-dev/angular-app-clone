import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MRScheduleRoutingModule } from './mr-schedule-routing.module';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { CreateScheduleComponent } from './create-schedule/create-schedule.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewMRScheduleComponent } from './view-mrschedule/view-mrschedule.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [
    ScheduleListComponent,
    CreateScheduleComponent,
    ViewMRScheduleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MRScheduleRoutingModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class MRScheduleModule { }
