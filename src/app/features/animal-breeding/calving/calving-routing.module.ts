import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalvingHistoryComponent } from './calving-history/calving-history.component';
import { CalvingComponent } from './calving/calving.component';
import { NewCalvingComponent } from './new-calving/new-calving.component';

const routes: Routes = [
  {path:'',component:CalvingComponent},
  {path:'view-history',component:CalvingHistoryComponent},
  {path:'new-calving',component:NewCalvingComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalvingRoutingModule { }
