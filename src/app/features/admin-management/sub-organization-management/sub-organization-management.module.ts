import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubOrganizationComponent } from './list/sub-organization.component';
import { subOrganizationManagementRoutingModule } from './sub-organization-management-routing.module';
import { SubOrganizationRegistrationFormComponent } from './sub-organization-registration-form/sub-organization-registration-form.component';
import { SubOrganizationDetailComponent } from './sub-organization-detail/sub-organization-detail.component';

@NgModule({
  declarations: [
       SubOrganizationComponent,
       SubOrganizationRegistrationFormComponent,
       SubOrganizationDetailComponent
  ],
  imports: [CommonModule, SharedModule,subOrganizationManagementRoutingModule],
})
export class SubOrganizationManagement {}
