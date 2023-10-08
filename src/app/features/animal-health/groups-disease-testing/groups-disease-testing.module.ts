import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupsDiseaseTestingRoutingModule } from './groups-disease-testing-routing.module';
import { GroupDiseaseTestingComponent } from './group-disease-testing.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PoolDiseaseTestingComponent } from './pool-disease-testing/pool-disease-testing.component';
import { GroupDialogComponent } from './group-dialog/group-dialog.component';
import { PoolDialogComponent } from './pool-dialog/pool-dialog.component';
import { DiseaseTestingModule } from '../disease-testing/disease-testing.module';
import { DiseaseTestingGroupComponent } from './disease-testing-group/disease-testing-group.component';
import { PreviousTestingDetailsComponent } from './previous-testing-details/previous-testing-details.component';
import { NewGroupTestComponent } from './new-group-test/new-group-test.component';
import { AnimalHealthModule } from '../animal-health.module';
import { GroupTestOnSpotComponent } from './group-test-on-spot/group-test-on-spot.component';
import { GroupTestSampleComponent } from './group-test-sample/group-test-sample.component';
import { AnimalByVillageComponent } from './animal-by-village/animal-by-village.component';
import { NewPoolTestComponent } from './new-pool-test/new-pool-test.component';
import { PoolTestOnSpotComponent } from './pool-test-on-spot/pool-test-on-spot.component';
import { PoolTestSampleComponent } from './pool-test-sample/pool-test-sample.component';
import { PreviousResultsComponent } from './previous-results/previous-results.component';


@NgModule({
  declarations: [
    GroupDiseaseTestingComponent,
    PoolDiseaseTestingComponent,
    GroupDialogComponent,
    PoolDialogComponent,
    DiseaseTestingGroupComponent,
    PreviousTestingDetailsComponent,
    NewGroupTestComponent,
    GroupTestOnSpotComponent,
    GroupTestSampleComponent,
    AnimalByVillageComponent,
    NewPoolTestComponent,
    PoolTestOnSpotComponent,
    PoolTestSampleComponent,
    PreviousResultsComponent
  ],
  exports : [GroupDiseaseTestingComponent,NewGroupTestComponent],
  imports: [
    CommonModule,
    GroupsDiseaseTestingRoutingModule,
    DiseaseTestingModule,
    AnimalHealthModule,
    SharedModule
  ]
})
export class GroupsDiseaseTestingModule { }
