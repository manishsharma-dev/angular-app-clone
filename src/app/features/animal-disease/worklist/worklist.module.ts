import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorklistRoutingModule } from './worklist-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WorklistComponent } from './worklist.component';
import { ActionFormComponent } from './action-form/action-form.component';
import { SeekClarificationDialogComponent } from './seek-clarification-dialog/seek-clarification-dialog.component';
import { SubmitDialogComponent } from './submit-dialog/submit-dialog.component';

@NgModule({
  declarations: [WorklistComponent, ActionFormComponent, SeekClarificationDialogComponent, SubmitDialogComponent],
  imports: [CommonModule, WorklistRoutingModule,SharedModule],
})
export class WorklistModule {}
