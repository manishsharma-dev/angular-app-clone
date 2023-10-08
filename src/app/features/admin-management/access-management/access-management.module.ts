import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { AccessManagementRoutingModule } from './access-management-routing.module';
import { AccessPrivilegeDetailsComponent } from './access-privilege-details/access-privilege-details.component';
import { RollListComponent } from './roll-list/roll-list.component';
import { AccessManagementComponent } from './create-role/access-management.component';

@NgModule({
  declarations: [AccessManagementComponent, AccessPrivilegeDetailsComponent, RollListComponent],
  imports: [CommonModule, SharedModule, AccessManagementRoutingModule],
})
export class AccessManagementModule {}
