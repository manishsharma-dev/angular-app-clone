import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddGeneticSampleComponent } from './add-genetic-sample/add-genetic-sample.component';
import { GeneticAnalysisComponent } from './genetic-analysis.component';
import { GeneticHistoryComponent } from './genetic-history/genetic-history.component';

const routes: Routes = [
  { path: '', component: GeneticAnalysisComponent },
  { path: 'add-genomic-sample', component: AddGeneticSampleComponent },
  { path: 'history', component: GeneticHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneticAnalysisRoutingModule {}
