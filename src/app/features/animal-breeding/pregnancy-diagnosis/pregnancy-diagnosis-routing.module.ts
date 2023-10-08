import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewpdComponent } from './newpd/newpd.component';
import { PdHistoryComponent } from './pd-history/pd-history.component';
import { PregnancyDiagnosisComponent } from './pregnancy-diagnosis/pregnancy-diagnosis.component';

const routes: Routes = [
  {path:'',component:PregnancyDiagnosisComponent},
  {path:'view-history',component:PdHistoryComponent},
  {path:'new-pd',component:NewpdComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PregnancyDiagnosisRoutingModule { }
