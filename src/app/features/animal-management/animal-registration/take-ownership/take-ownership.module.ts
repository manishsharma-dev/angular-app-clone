import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TakeOwnershipRoutingModule } from './take-ownership-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, TakeOwnershipRoutingModule],
})
export class TakeOwnershipModule {}
