import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OutbreakDiseaseReportingComponent } from './outbreak-disease-reporting.component';
import { OutbreakFollowUpComponent } from './outbreak-follow-up/outbreak-follow-up.component';

const routes: Routes = [
  {
    path: "",
    component: OutbreakDiseaseReportingComponent
  },
  {
    path: "outbreak-follow-up",
    component: OutbreakFollowUpComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutbreakDiseaseReportingRoutingModule { }
