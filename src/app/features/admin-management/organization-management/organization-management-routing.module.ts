import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrgRegFormComponent } from './org-reg-form/org-reg-form.component';
import { OrganizationManagementComponent } from './list/organization-management.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';

//child routing of component
const routes: Routes = [
  {
    path: 'list',
    component: OrganizationManagementComponent,
  },
  {
    path: 'add-new-org',
    component: OrgRegFormComponent,
  },
  {
    path: 'edit-org',
    component: OrgRegFormComponent,
  },
  {
    path: 'org-details',
    component: OrganizationDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationManagementRoutingModule {}
