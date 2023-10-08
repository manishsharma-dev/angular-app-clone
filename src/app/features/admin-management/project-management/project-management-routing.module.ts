import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ProjectRegFormComponent } from './project-reg-form/project-reg-form.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectExtensionComponent } from './project-extension/project-extension.component';
import { ProjectAllocDeallocComponent } from './project-alloc-dealloc/project-alloc-dealloc.component';
import { ProjectUserDetailsComponent } from './project-user-details/project-user-details.component';

import { ProjectManagementComponent } from './list/project-management.component';

const routes: Routes = [
  {
    path: 'list',
    component: ProjectManagementComponent,
  },
  {
    path: 'add-new-project',
    component: ProjectRegFormComponent,
  },
  {
    path: 'edit-projects',
    component: ProjectRegFormComponent,
  },
  {
    path: 'project-details',
    component: ProjectDetailsComponent,
  },
  {
    path: 'project-extension',
    component: ProjectExtensionComponent,
  },
 
  {
    path: 'userallocationdeallocation',
    component: ProjectAllocDeallocComponent,
  },
  {
    path: 'allocateUser',
    component: ProjectUserDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
})
export class ProjectManagementRoutingModule {}
