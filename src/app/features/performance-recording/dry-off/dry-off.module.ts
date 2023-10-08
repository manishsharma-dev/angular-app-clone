import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DryOffRoutingModule } from './dry-off-routing.module';
import { DryOffComponent } from './dry-off.component';
import { DryOffDetailsFormDialogComponent } from './dry-off-details-form-dialog/dry-off-details-form-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [DryOffComponent, DryOffDetailsFormDialogComponent],
  imports: [CommonModule, DryOffRoutingModule, SharedModule],
})
export class DryOffModule {}
