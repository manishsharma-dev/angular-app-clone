import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EliteAnimalDeclarationRoutingModule } from './elite-animal-declaration-routing.module';
import { EliteAnimalDeclarationComponent } from './elite-animal-declaration.component';
import { ModifyEliteStatusComponent } from './modify-elite-status/modify-elite-status.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [EliteAnimalDeclarationComponent, ModifyEliteStatusComponent],
  imports: [CommonModule, EliteAnimalDeclarationRoutingModule, SharedModule],
})
export class EliteAnimalDeclarationModule {}
