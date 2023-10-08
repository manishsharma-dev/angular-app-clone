import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdmindashComponent } from './admindash/admindash.component';
import { AdminManagementRoutingModule } from './admin-management-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminCommonFilterComponent } from './admin-common-filter/admin-common-filter.component';

@NgModule({
  declarations: [AdmindashComponent, AdminCommonFilterComponent],
  imports: [CommonModule, AdminManagementRoutingModule, SharedModule],
  exports: [AdminCommonFilterComponent],
})
export class AdminManagementModule {}
