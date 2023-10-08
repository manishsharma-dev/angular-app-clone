import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignDetailComponent } from './campaign-detail/campaign-detail.component';
import { OnSearchDetailsComponent } from './on-search-details/on-search-details.component';
import { VaccinationComponent } from './vaccination.component';
import { WithoutCampDetailsComponent } from './without-camp-details/without-camp-details.component';

const routes: Routes = [
  { path: "", component: VaccinationComponent},
  { path: "details", component: CampaignDetailComponent},
  { path: "without-details", component: WithoutCampDetailsComponent},
  { path: "search-details", component: OnSearchDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VaccinationRoutingModule { }
