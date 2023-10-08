import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenerateSampleIdsComponent } from './generate-sample-ids.component';
import { PreviousSampleIdsComponent } from './previous-sample-ids/previous-sample-ids.component';

const routes: Routes = [
  { path: '', component: GenerateSampleIdsComponent },
  { path: 'previous-sample-ids', component: PreviousSampleIdsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerateSampleIdsRoutingModule {}
