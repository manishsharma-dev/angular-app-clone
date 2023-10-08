import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationComponent } from './notification/notification/notification.component';
import { ViewNotificationComponent } from './view-notification/view-notification.component';
import { WorkListComponent } from './worklist/worklist.component';
// import { AddTagComponent } from './add-tag/add-tag.component';
// import { TagGenerationComponent } from './tag-generation/tag-generation.component';

const routes: Routes = [
  { path: '', component: NotificationComponent },
  { path: 'work-list', component: WorkListComponent },
  { path: 'notification-detail', component: ViewNotificationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkListRoutingModule {}
