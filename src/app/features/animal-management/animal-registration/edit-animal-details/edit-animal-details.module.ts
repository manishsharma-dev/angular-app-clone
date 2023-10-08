import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditAnimalDetailsRoutingModule } from './edit-animal-details-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    EditAnimalDetailsRoutingModule
  ]
})
export class EditAnimalDetailsModule { }
