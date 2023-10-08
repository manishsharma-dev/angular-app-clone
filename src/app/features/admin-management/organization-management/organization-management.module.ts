import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrganizationManagementComponent } from './list/organization-management.component';
import { OrgRegFormComponent } from './org-reg-form/org-reg-form.component';
import { OrganizationManagementRoutingModule } from './organization-management-routing.module';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';

@NgModule({
  declarations: [
    OrganizationManagementComponent,
    OrgRegFormComponent,
    OrganizationDetailsComponent,
  ],
  imports: [CommonModule, OrganizationManagementRoutingModule, SharedModule],
})
export class OrganizationManagement {}
