import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreaAllocationListComponent } from './area-allocation-list/area-allocation-list.component';
import { AddNewUserComponent } from './add-new-user/add-new-user.component';
import UserListComponent from './list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';


const routes: Routes = [
  { path: 'list', component: UserListComponent },
  { path: 'add-new-user', component: AddNewUserComponent },
  { path: 'user-details', component: UserDetailsComponent },
  { path: 'edit-user', component: AddNewUserComponent },
  { path: 'area-list', component: AreaAllocationListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule { }
