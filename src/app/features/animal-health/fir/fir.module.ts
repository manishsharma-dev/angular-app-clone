import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FIRRoutingModule } from './fir-routing.module';
import { FirDetailsFormComponent } from './fir-details-form/fir-details-form.component';
import { DraftFirDialogComponent } from './draft-fir-dialog/draft-fir-dialog.component';
import { FIRComponent } from './fir.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FirDiseaseTestingComponent } from './fir-disease-testing/fir-disease-testing.component';
import { AnimalHealthModule } from '../animal-health.module';
import { GroupsDiseaseTestingModule } from '../groups-disease-testing/groups-disease-testing.module';
import { DiseaseTestingModule } from '../disease-testing/disease-testing.module';

@NgModule({
  declarations: [
    FIRComponent,
    FirDetailsFormComponent,
    DraftFirDialogComponent,
    FirDiseaseTestingComponent,
  ],
  imports: [SharedModule, CommonModule, FIRRoutingModule, AnimalHealthModule, GroupsDiseaseTestingModule, DiseaseTestingModule],
})
export class FIRModule { }
