import { EditAnimalDetailsComponent } from './edit-animal-details/edit-animal-details.component';
import { EditAnimalComponent } from './edit-animal/edit-animal.component';
import { EarTagChangeComponent } from './ear-tag-change/ear-tag-change.component';
import { AnimalDetailComponent } from './animal-details/list/animal-detail.component';
import { AddInfoDialogComponent } from './add-info-dialog/add-info-dialog.component';
import { AddAnimalComponent } from './add-animal/add-animal.component';
import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalRoutingModule } from './animal-registration-routing.module';
import { AnimalDashComponent } from './animal-dash/animal-dash.component';
import { EarTagDialogComponent } from './ear-tag-dialog/ear-tag-dialog.component';
import { ViewTransactionsDialogComponent } from './view-transactions-dialog/view-transactions-dialog.component';
import { ViewOrganizationComponent } from './view-organization/view-organization.component';
import { ModifyAnimalDetailsComponent } from './modify-animal-details/modify-animal-details.component';
import { TakeOwnershipComponent } from './take-ownership/take-ownership.component';
import { LatestAnimalTagComponent } from './latest-animal-tag/latest-animal-tag.component';

@NgModule({
  declarations: [
    AnimalDashComponent,
    AddAnimalComponent,
    AddInfoDialogComponent,
    AnimalDetailComponent,
    EarTagChangeComponent,
    EarTagDialogComponent,
    EditAnimalComponent,
    EditAnimalDetailsComponent,
    ViewTransactionsDialogComponent,
    ViewOrganizationComponent,
    ModifyAnimalDetailsComponent,
    TakeOwnershipComponent,
    LatestAnimalTagComponent
  ],
  imports: [CommonModule, SharedModule, AnimalRoutingModule],
})
export class AnimalModule {}
