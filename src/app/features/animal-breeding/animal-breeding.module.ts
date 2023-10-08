import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnimalBreedingRoutingModule } from './animal-breeding-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AgeDialogComponent } from './age-dialog/age-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { ModifyAnimalDetailsComponent } from './modify-animal-details/modify-animal-details.component';

@NgModule({
  declarations: [
  
    AgeDialogComponent,
        SuccessDialogComponent,
        ModifyAnimalDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AnimalBreedingRoutingModule,
  ],
  exports:[]
})
export class AnimalBreedingModule { }
