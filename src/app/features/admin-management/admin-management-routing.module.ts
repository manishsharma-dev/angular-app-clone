import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdmindashComponent } from './admindash/admindash.component';

const routes: Routes = [
  {
    path: '',
    component: AdmindashComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminManagementRoutingModule {}
