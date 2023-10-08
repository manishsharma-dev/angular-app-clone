import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalDetailsRoutingModule } from './animal-details-routing.module';
import { AnimalDetailComponent } from './list/animal-detail.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    AnimalDetailsRoutingModule
  ]
})
export class AnimalDetailsModule { }
