import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";

import { AuthRoutingModule } from "./auth-routing.module";
import { AngularMaterialModule } from "src/app/shared/angular-material.module";
import { ForgotPasswordModule } from "./forgot-password/forgot-password.module";
import { MobileVerficationComponent } from './mobile-verfication/mobile-verfication.component';




@NgModule({
  declarations: [LoginComponent, SignupComponent, MobileVerficationComponent],
  imports: [CommonModule, AngularMaterialModule, FormsModule, AuthRoutingModule,FormsModule,
    ReactiveFormsModule,ForgotPasswordModule]
})
export class AuthModule {}
