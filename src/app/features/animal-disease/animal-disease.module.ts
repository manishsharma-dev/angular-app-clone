import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnimalDiseaseRoutingModule } from './animal-disease-routing.module';
import { WorklistComponent } from './worklist/worklist.component';
import { ActionFormComponent } from './worklist/action-form/action-form.component';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    AnimalDiseaseRoutingModule
  ]
})
export class AnimalDiseaseModule { }
