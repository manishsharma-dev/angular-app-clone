import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TypingRoutingModule } from './typing-routing.module';
import { TypingComponent } from './typing.component';
import { NewTypingComponent } from './new-typing/new-typing.component';
import { PreviewTypingDialogComponent } from './preview-typing-dialog/preview-typing-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    TypingComponent,
    NewTypingComponent,
    PreviewTypingDialogComponent,
  ],
  imports: [CommonModule, TypingRoutingModule, SharedModule],
})
export class TypingModule {}
