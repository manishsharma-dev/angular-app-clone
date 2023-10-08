import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnimalHealthRoutingModule } from './animal-health-routing.module';
import { TreatmentResponseDialogComponent } from './treatment-response-dialog/treatment-response-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LabTestingSampleComponent } from './components/lab-testing-sample/lab-testing-sample.component';
import { OnSpotTestingComponent } from './components/on-spot-testing/on-spot-testing.component';
import { HealthHistoryComponent } from './components/health-history/health-history.component';
import { SavedDraftListComponent } from './components/saved-draft-list/saved-draft-list.component';
import { AnimalSearchComponent } from './components/animal-search/animal-search.component';
import { ObjectEntriesPipe } from './components/health-history/object-entries.pipe';
@NgModule({
  declarations: [
    TreatmentResponseDialogComponent,
    LabTestingSampleComponent,
    OnSpotTestingComponent,
    HealthHistoryComponent,
    SavedDraftListComponent,
    AnimalSearchComponent,
    ObjectEntriesPipe,
  ],
  imports: [CommonModule, AnimalHealthRoutingModule, SharedModule],
  exports: [LabTestingSampleComponent, SavedDraftListComponent, ObjectEntriesPipe],
})
export class AnimalHealthModule {}
