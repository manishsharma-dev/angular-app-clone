import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignCreationComponent } from './campaign-creation.component';

const routes: Routes = [
  { path: "", component: CampaignCreationComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignCreationRoutingModule { }
