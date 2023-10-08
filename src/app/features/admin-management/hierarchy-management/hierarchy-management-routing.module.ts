import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddNewHierarchyComponent } from './add-new-hierarchy/add-new-hierarchy.component';
import { HierarchyListComponent } from './list/hierarchy-list.component';
import { PreviewHierarchyDialogComponent } from './preview-hierarchy-dialog/preview-hierarchy-dialog.component';

const routes: Routes = [
  { path: 'list', component: HierarchyListComponent },
  { path: 'add-new-hierarchy', component: AddNewHierarchyComponent },
  { path: 'hierarchy-preview', component: PreviewHierarchyDialogComponent },
  // { path: 'edit-user', component: AddNewUserComponent },
  // { path: 'area-list', component: AreaAllocationListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HierarchyManagementRoutingModule { }
