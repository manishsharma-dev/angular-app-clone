import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtificialInseminationComponent } from './artificial-insemination.component';
import { NewAiComponent } from './new-ai/new-ai.component';
import { ViewHistoryComponent } from './view-history/view-history.component';

const routes: Routes = [
  {path:'',component:ArtificialInseminationComponent},
  {path:'newai',component:NewAiComponent},
  {path:'view-history',component:ViewHistoryComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtificialInseminationRoutingModule { }