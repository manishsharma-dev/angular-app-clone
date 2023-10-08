import { OwnerTransferDetailsEditComponent } from './owner-transfer-details-edit/owner-transfer-details-edit.component';
import { OwnerDetailsComponent } from './owner-details/owner-details.component';
import { OwnerDashComponent } from './owner-dash/owner-dash.component';
import { AddDetailsDialogComponent } from './add-details-dialog/add-details-dialog.component';
import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerRoutingModule } from './owner-registration-routing.module';
import { OwnerTransferDialogComponent } from './owner-transfer-dialog/owner-transfer-dialog.component';
import { EditOwnerDetailsComponent } from './edit-owner-details/edit-owner-details.component';
import { OwnerTransferComponent } from './owner-transfer/owner-transfer.component';
import { ModifyOwnerDetailsComponent } from './modify-owner-details/modify-owner-details.component';
import { OwnerResponseDialogComponent } from './owner-response-dialog/owner-response-dialog.component';
import { RegistrationPreviewComponent } from './registration-preview/registration-preview.component';
import { ModifyOwnerDetailsVillageWiseComponent } from './modify-owner-details-villagewise/modify-owner-details.component';

@NgModule({
  declarations: [
    AddDetailsDialogComponent,
    EditOwnerDetailsComponent,
    OwnerDashComponent,
    OwnerDetailsComponent,
    OwnerTransferComponent,
    OwnerTransferDetailsEditComponent,
    OwnerTransferDialogComponent,
    ModifyOwnerDetailsComponent,
    ModifyOwnerDetailsVillageWiseComponent,
    OwnerResponseDialogComponent,
    RegistrationPreviewComponent,
  ],
  imports: [CommonModule, SharedModule, OwnerRoutingModule],
  entryComponents: [],
})
export class OwnerModule {}
