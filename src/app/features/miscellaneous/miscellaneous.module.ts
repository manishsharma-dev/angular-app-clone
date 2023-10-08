import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiscellaneousRoutingModule } from './miscellaneous-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, MiscellaneousRoutingModule, SharedModule],
})
export class MiscellaneousModule {}
