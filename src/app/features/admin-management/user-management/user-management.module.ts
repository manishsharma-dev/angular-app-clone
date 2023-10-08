import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddNewUserComponent } from './add-new-user/add-new-user.component';
import UserListComponent from './list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { AreaAllocationListComponent } from './area-allocation-list/area-allocation-list.component';
import { AreaAllocationFormDialogComponent } from './area-allocation-form-dialog/area-allocation-form-dialog.component';
import { UserAllocDeallocComponent } from './user-alloc-dealloc/user-alloc-dealloc.component';
import { AdminManagementModule } from '../admin-management.module';
import { AdditionalAreaAllocationComponent } from './additional-area-allocation/additional-area-allocation.component';
import { ManageAdditionalAreaAllocationComponent } from './manage-additional-area-allocation/manage-additional-area-allocation.component';
import { NewAreaAllocationComponent } from './new-area-allocation/new-area-allocation.component';

@NgModule({
  declarations: [
    UserListComponent,
    AddNewUserComponent,
    UserDetailsComponent,
    AreaAllocationListComponent,
    AreaAllocationFormDialogComponent,
    UserAllocDeallocComponent,
    AdditionalAreaAllocationComponent,
    ManageAdditionalAreaAllocationComponent,
    NewAreaAllocationComponent,
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    SharedModule,
    AdminManagementModule
  ],
})
export class UserManagementModule { }
