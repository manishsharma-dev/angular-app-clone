import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BreedingValueEstimationRoutingModule } from './breeding-value-estimation-routing.module';
import { BreedingValueEstimationComponent } from './breeding-value-estimation.component';
import { UploadFileDialogComponent } from './upload-file-dialog/upload-file-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    BreedingValueEstimationComponent,
    UploadFileDialogComponent
  ],
  imports: [
    CommonModule,
    BreedingValueEstimationRoutingModule,
    SharedModule
  ]
})
export class BreedingValueEstimationModule { }
