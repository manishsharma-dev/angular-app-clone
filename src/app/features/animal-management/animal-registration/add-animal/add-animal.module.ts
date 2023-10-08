import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAnimalRoutingModule } from './add-animal-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, AddAnimalRoutingModule],
})
export class AddAnimalModule {}
