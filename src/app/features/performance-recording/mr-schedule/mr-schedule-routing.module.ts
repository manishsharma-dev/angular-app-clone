import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateScheduleComponent } from './create-schedule/create-schedule.component';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { ViewMRScheduleComponent } from './view-mrschedule/view-mrschedule.component';

const routes: Routes = [
  { path: 'create-mr', component: ScheduleListComponent },
  { path: 'create-schedule', component: CreateScheduleComponent },
  { path: 'view-mr', component: ViewMRScheduleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MRScheduleRoutingModule {}
