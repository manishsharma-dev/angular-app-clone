import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessPrivilegeDetailsComponent } from './access-privilege-details/access-privilege-details.component';
import { AccessManagementComponent } from './create-role/access-management.component';
import { RollListComponent } from './roll-list/roll-list.component';

const routes: Routes = [
  {
    path: 'add-new-roll',
    component: AccessManagementComponent,
  },
  {
    path: 'role-details',
    component: AccessPrivilegeDetailsComponent,
  },
  {
    path: 'list',
    component: RollListComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessManagementRoutingModule {}
