import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EliteAnimalDeclarationComponent } from './elite-animal-declaration.component';
import { ModifyEliteStatusComponent } from './modify-elite-status/modify-elite-status.component';

const routes: Routes = [
  {
    path: '',
    component: EliteAnimalDeclarationComponent,
  },
  {
    path: 'modify-status',
    component: ModifyEliteStatusComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EliteAnimalDeclarationRoutingModule {}
