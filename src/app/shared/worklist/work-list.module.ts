import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { TagGenerationComponent } from './tag-generation/tag-generation.component';
// import { AddTagComponent } from './add-tag/add-tag.component';
// import { TagManagementRoutingModule } from './tag-management-routing.module';
 import { SharedModule } from 'src/app/shared/shared.module';
import { WorkListRoutingModule } from './work-list-routing.module';
import { WorkListComponent } from './worklist/worklist.component';
import { ViewWorkListComponent } from './view-worklist/view-worklist.component';
import { NotificationComponent } from './notification/notification/notification.component';
import { ViewNotificationComponent } from './view-notification/view-notification.component';
import { NotificationHeaderComponent } from './notification-header/notification-header.component';
// import { WorkListComponent } from './worklist/worklist.component';
// import { PurchaseRequestPopupComponent } from './purchase-request-popup/purchase-request-popup.component';

@NgModule({
  declarations: [
    WorkListComponent,
    ViewWorkListComponent,
    NotificationComponent,
    ViewNotificationComponent,
    NotificationHeaderComponent   
  ],
  imports: [
    CommonModule,
    SharedModule,
    WorkListRoutingModule ,    
  ]
})

export class WorkListModule { }
