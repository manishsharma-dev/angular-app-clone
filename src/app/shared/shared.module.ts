import { RemarksDialogComponent } from './remarks-dialog/remarks-dialog.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './angular-material.module';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BootstrapModule } from './ng-bootstrap.module';
import { LayoutComponent } from './layout/layout/layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { MessageComponent } from './message/list/message.component';
import { NgSelectModule } from '@ng-select/ng-select';

import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { RightSidebarComponent } from './right-sidebar/right-sidebar.component';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CommonSearchComponent } from './common-search/common-search.component';
import { BreedingHistoryComponent } from '../features/animal-breeding/breeding-history/breeding-history.component';
import { OtpDialogComponent } from './otp-dialog/otp-dialog.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { HasRoleDirective } from './utility/directives/has-role.directive';
import { StringConcatPipe } from './utility/pipes/string-concat.pipe';
import { DragAndDropDirective } from './utility/directives/drag-and-drop.directive';
import { ConfirmationDeleteDialogComponent } from './confirmation-delete-dialog/confirmation-delete-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterPipe } from './utility/pipes/filter.pipe';
import { CommonOwnerDetailComponent } from './common-owner-detail/owner-detail.component';
import { CustomDateFormatterPipe } from './utility/pipes/custom-date-formatter.pipe';
import { PermissionDirective } from './utility/directives/permission.directive';
import { RoutePermissionDirective } from './utility/directives/route-permission.directive';
import { ModuleTranslationPipe } from './utility/pipes/moduleTranslation.pipe';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  CUSTOM_DATE_FORMAT,
  CustomDateAdapter,
} from './utility/custom-date-format';
import { CommonSearchBoxComponent } from './common-search-box/common-search-box.component';
import { MobileformatterPipe } from './utility/pipes/mobileformatter.pipe';
import { CommonOwnersListComponent } from './common-owners-list/common-owners-list.component';
import { CommonBreadcrumbComponent } from './common-breadcrumb/common-breadcrumb.component';
import { AgePipe } from './utility/pipes/age.pipe';

@NgModule({
  declarations: [
    FilterPipe,
    HeaderComponent,
    LayoutComponent,
    SidenavComponent,
    DashboardLayoutComponent,
    MessageComponent,
    OtpDialogComponent,
    OtpVerificationComponent,
    ConfirmationDialogComponent,
    RightSidebarComponent,
    HasRoleDirective,
    StringConcatPipe,
    DragAndDropDirective,
    CommonSearchComponent,
    BreedingHistoryComponent,
    ConfirmationDeleteDialogComponent,
    CommonOwnerDetailComponent,
    CustomDateFormatterPipe,
    MobileformatterPipe,
    RemarksDialogComponent,
    PermissionDirective,
    RoutePermissionDirective,
    ModuleTranslationPipe,
    CommonSearchBoxComponent,
    CommonOwnersListComponent,
    CommonBreadcrumbComponent,
    AgePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    BootstrapModule,
    RouterModule,
    HttpClientModule,
    TranslateModule,
    NgSelectModule,
    InfiniteScrollModule,
    InfiniteScrollModule,
    NgbModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    BootstrapModule,
    HeaderComponent,
    LayoutComponent,
    SidenavComponent,
    HttpClientModule,
    TranslateModule,
    MessageComponent,
    NgSelectModule,
    HasRoleDirective,
    InfiniteScrollModule,
    StringConcatPipe,
    DragAndDropDirective,
    CommonSearchComponent,
    BreedingHistoryComponent,
    FilterPipe,
    NgbModule,
    CustomDateFormatterPipe,
    MobileformatterPipe,
    CommonOwnerDetailComponent,
    PermissionDirective,
    RoutePermissionDirective,
    RemarksDialogComponent,
    ModuleTranslationPipe,
    CommonSearchBoxComponent,
    CommonOwnersListComponent,
    CommonBreadcrumbComponent,
    AgePipe,
  ],
  entryComponents: [],
  providers: [
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT },
  ],
})
export class SharedModule {}
