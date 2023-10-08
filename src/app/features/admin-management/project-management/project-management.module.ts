import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectManagementRoutingModule } from './project-management-routing.module';

import { ProjectRegFormComponent } from './project-reg-form/project-reg-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectExtensionComponent } from './project-extension/project-extension.component';
import { ProjectAllocDeallocComponent } from './project-alloc-dealloc/project-alloc-dealloc.component';
import { ProjectUserDetailsComponent } from './project-user-details/project-user-details.component';
import { AllocConfirmationComponent } from './project-user-details/alloc-confirmation/alloc-confirmation.component';
import { DatePickerPopupComponent } from './project-user-details/date-picker-popup/date-picker-popup.component';

import { ProjectManagementComponent } from './list/project-management.component';
import { ViewOrgDetailsComponent } from './view-org-details/view-org-details.component';
import { UserAllocationSerachComponent } from './user-allocation-serach/user-allocation-serach.component';
import { ViewUserAllDeallocComponent } from './view-user-all-dealloc/view-user-all-dealloc.component';

@NgModule({
  declarations: [
    ProjectManagementComponent,
    ProjectRegFormComponent,
    ProjectDetailsComponent,
    ProjectExtensionComponent,
    ProjectAllocDeallocComponent,
    ProjectUserDetailsComponent,
    AllocConfirmationComponent,
    DatePickerPopupComponent,
    ViewOrgDetailsComponent,
    UserAllocationSerachComponent,
    ViewUserAllDeallocComponent,
  ],
  imports: [CommonModule, ProjectManagementRoutingModule, SharedModule],
  })
export class ProjectManagementModule {}
