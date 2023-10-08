import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubOrganizationComponent } from './list/sub-organization.component';
import { SubOrganizationDetailComponent } from './sub-organization-detail/sub-organization-detail.component';
import { SubOrganizationRegistrationFormComponent } from './sub-organization-registration-form/sub-organization-registration-form.component';


//child routing of component
const routes: Routes = [
  {
    path: 'list',
    component: SubOrganizationComponent,
  },
  {
    path: 'regform',
    component: SubOrganizationRegistrationFormComponent,
  },
  {
    path: 'detail',
    component: SubOrganizationDetailComponent,
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class subOrganizationManagementRoutingModule {}
