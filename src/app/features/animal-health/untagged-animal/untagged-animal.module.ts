import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UntaggedAnimalRoutingModule } from './untagged-animal-routing.module';
import { UntaggedFormComponent } from './untagged-form/untagged-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PreviewDetailDialogComponent } from './preview-detail-dialog/preview-detail-dialog.component';
import { SaveDownloadDialogComponent } from './save-download-dialog/save-download-dialog.component';
import { ViewUntaggedTransactionsComponent } from './view-untagged-transactions/view-untagged-transactions.component';

@NgModule({
  declarations: [UntaggedFormComponent, PreviewDetailDialogComponent, SaveDownloadDialogComponent, ViewUntaggedTransactionsComponent],
  imports: [CommonModule, UntaggedAnimalRoutingModule, SharedModule],
})
export class UntaggedAnimalModule {}
