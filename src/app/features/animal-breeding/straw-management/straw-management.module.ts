import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StrawManagementRoutingModule } from './straw-management-routing.module';
import { StrawListingComponent } from './straw-listing/straw-listing.component';
import { AddEditStrawComponent } from './add-edit-straw/add-edit-straw.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddStrawDialogComponent } from './add-straw-dialog/add-straw-dialog.component';


@NgModule({
  declarations: [
    StrawListingComponent,
    AddEditStrawComponent,
    AddStrawDialogComponent
  ],
  imports: [
    CommonModule,
    StrawManagementRoutingModule,
    SharedModule
  ]
})
export class StrawManagementModule { }
