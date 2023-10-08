import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { AnimalTreatmentComponent } from '../animal-treatment/animal-treatment.component';
import { AddDiagnosticsComponent } from './add-diagnostics/add-diagnostics.component';
import { AddMedicineComponent } from './add-medicine/add-medicine.component';
import { AnimalTreatmentRoutingModule } from './animal-treatment-routing.module';
import { FollowUpComponent } from './follow-up/follow-up.component';
import { NewCaseComponent } from './new-case/new-case.component';
import { SubmitDialogComponent } from './submit-dialog/submit-dialog.component';
import { UpdateResultsComponent } from './update-results/update-results.component';
import { ViewPrescriptionComponent } from './view-prescription/view-prescription.component';
import { AnimalHealthModule } from '../animal-health.module';
import { ViewReportComponent } from './view-report/view-report.component';
import { UpdateLabComponent } from './update-lab/update-lab.component';
import { PreviewCaseComponent } from './preview-case/preview-case.component';

@NgModule({
  declarations: [
    AnimalTreatmentComponent,
    NewCaseComponent,
    AddMedicineComponent,
    AddDiagnosticsComponent,
    SubmitDialogComponent,
    FollowUpComponent,
    ViewPrescriptionComponent,
    UpdateResultsComponent,
    ViewReportComponent,
    UpdateLabComponent,
    PreviewCaseComponent,
  ],
  providers: [
    DatePipe,

  ],
  imports: [
    CommonModule,
    SharedModule,
    AnimalTreatmentRoutingModule,
    AnimalHealthModule,
   
  ],
  // providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  entryComponents: [],
})
export class AnimalTreatmentModule {}
