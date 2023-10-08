import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditAnimalRoutingModule } from './edit-animal-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    EditAnimalRoutingModule
  ]
})
export class EditAnimalModule { }
