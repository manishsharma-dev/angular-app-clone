import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
  { path: "", component: ForgotPasswordComponent},
  { path: "changePassword", component: ChangePasswordComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForgotPasswordRoutingModule { }
