import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewTransactionsDialogComponent } from './view-transactions-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: ViewTransactionsDialogComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTransactionsRoutingModule {}
