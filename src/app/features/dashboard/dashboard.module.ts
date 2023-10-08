import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashbaordRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ResetPasswordComponent } from '../auth/reset-password/reset-password';


@NgModule({
  declarations: [DashboardComponent, ResetPasswordComponent],
  imports: [DashbaordRoutingModule,SharedModule],
  entryComponents: []
})
export class DashboardModule { }
