import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtificialInseminationComponent } from './artificial-insemination/artificial-insemination.component';

const routes: Routes = [
  {
    path: 'artificial-insemination',
    loadChildren: () =>
      import('./artificial-insemination/artificial-insemination.module').then(
        (m) => m.ArtificialInseminationModule
      ),
  },
  {
    path: 'pregnancy-diagnosis',
    loadChildren: () =>
      import('./pregnancy-diagnosis/pregnancy-diagnosis.module').then(
        (m) => m.PregnancyDiagnosisModule
      ),
  },
  {
    path: 'calving',
    loadChildren: () =>
      import('./calving/calving.module').then((m) => m.CalvingModule),
  },
  {
    path: 'et',
    loadChildren: () => import('./et/et.module').then((m) => m.EtModule),
  },
  {
    path: 'bull-master',
    loadChildren: () =>
      import('./bull-master/bull-master.module').then(
        (m) => m.BullMasterModule
      ),
  },
  {
    path: 'test-ai',
    loadChildren: () =>
      import('./test-ai/test-ai.module').then((m) => m.TestAIModule),
  },
  {
    path: 'elite-animal',
    loadChildren: () =>
      import('./elite-animal-declaration/elite-animal-declaration.module').then(
        (m) => m.EliteAnimalDeclarationModule
      ),
  },
  {
    path: 'semen-straw-management',
    loadChildren: () =>
      import('./straw-management/straw-management.module').then(
        (m) => m.StrawManagementModule
      ),
  },
  {
    path: 'breeding-value-estimation',
    loadChildren: () =>
      import('./breeding-value-estimation/breeding-value-estimation.module').then(
        (m) => m.BreedingValueEstimationModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnimalBreedingRoutingModule {}
