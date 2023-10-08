import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UntaggedFormComponent } from './untagged-form/untagged-form.component';
import { ViewUntaggedTransactionsComponent } from './view-untagged-transactions/view-untagged-transactions.component';

const routes: Routes = [
  {
    path: 'untagged-treatment',
    component: UntaggedFormComponent,
  },
  {
    path: 'untagged-first-aid',
    component: UntaggedFormComponent,
  },
  {
    path: 'view-transactions',
    component: ViewUntaggedTransactionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UntaggedAnimalRoutingModule {}
