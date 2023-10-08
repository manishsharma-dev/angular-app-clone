import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HierarchyManagementRoutingModule } from './hierarchy-management-routing.module';
import { AddNewHierarchyComponent } from './add-new-hierarchy/add-new-hierarchy.component';
import { HierarchyListComponent } from './list/hierarchy-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PreviewHierarchyDialogComponent } from './preview-hierarchy-dialog/preview-hierarchy-dialog.component';


@NgModule({
  declarations: [
    AddNewHierarchyComponent,
    HierarchyListComponent,
    PreviewHierarchyDialogComponent
  ],
  imports: [CommonModule, HierarchyManagementRoutingModule, SharedModule],
})
export class HierarchyManagementModule { }
