import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DryOffComponent } from './dry-off.component';

const routes: Routes = [
  {
    path: '',
    component: DryOffComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DryOffRoutingModule {}
