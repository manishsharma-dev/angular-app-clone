import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password";

import { LoginComponent } from "./login/login.component";
import { ResetPasswordComponent } from "./reset-password/reset-password";

import { SignupComponent } from "./signup/signup.component";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "forgot-password", component: ForgotPasswordComponent }
 
 
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
