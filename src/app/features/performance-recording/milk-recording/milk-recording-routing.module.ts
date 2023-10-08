import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMilkRecordingComponent } from './add-mr/add-milk-recording/add-milk-recording.component';
import { AddMRComponent } from './add-mr/add-mr.component';
import { BreedingHistoryComponent } from './breeding-history/breeding-history.component';
import { AddPreviousMRComponent } from './previous-mr/add-previous-mr/add-previous-mr.component';
import { PreviousMRComponent } from './previous-mr/previous-mr.component';

const routes: Routes = [
  {
    path: 'add-mr',
    component: AddMRComponent,
  },
  {
    path: 'add-mr-form',
    component: AddMilkRecordingComponent,
  },
  {
    path: 'previous-mr',
    component: PreviousMRComponent,
  },
  {
    path: 'add-previous-mr',
    component: AddPreviousMRComponent,
  },
  {
    path: 'view-history',
    component: BreedingHistoryComponent,
    data: { showBreadCrumb: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MilkRecordingRoutingModule {}
