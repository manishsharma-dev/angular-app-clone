import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GenerateSampleIdsRoutingModule } from './generate-sample-ids-routing.module';
import { GenerateSampleIdsComponent } from './generate-sample-ids.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AvailableIdsListComponent } from './available-ids-list/available-ids-list.component';
import { PreviousSampleIdsComponent } from './previous-sample-ids/previous-sample-ids.component';

@NgModule({
  declarations: [GenerateSampleIdsComponent, AvailableIdsListComponent, PreviousSampleIdsComponent],
  imports: [CommonModule, SharedModule, GenerateSampleIdsRoutingModule],
})
export class GenerateSampleIdsModule {}
